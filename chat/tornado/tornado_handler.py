import json
import logging
from datetime import timedelta
from itertools import chain
from numbers import Number
from threading import Thread

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db.models import F, Q
from redis_sessions.session import SessionStore
from tornado import ioloop
from tornado.httpclient import AsyncHTTPClient, HTTPRequest
from tornado.web import asynchronous
from tornado.websocket import WebSocketHandler, WebSocketClosedError

from chat.cookies_middleware import create_id
from chat.models import User, Message, UserJoinedInfo, IpAddress, Room, RoomUsers
from chat.py2_3 import str_type, urlparse
from chat.tornado.anti_spam import AntiSpam
from chat.tornado.constants import VarNames, HandlerNames, Actions, RedisPrefix
from chat.tornado.message_creator import MessagesCreator
from chat.tornado.message_handler import MessagesHandler, WebRtcMessageHandler
from chat.utils import execute_query, do_db, \
	get_message_images_videos, get_or_create_ip_wrapper, create_ip_structure, get_history_message_query

sessionStore = SessionStore()

parent_logger = logging.getLogger(__name__)


class TornadoHandler(WebSocketHandler, WebRtcMessageHandler):

	def __init__(self, *args, **kwargs):
		super(TornadoHandler, self).__init__(*args, **kwargs)
		self.__connected__ = False
		self.restored_connection = False
		self.__http_client__ = AsyncHTTPClient()
		self.anti_spam = AntiSpam()

	@property
	def connected(self):
		return self.__connected__

	@connected.setter
	def connected(self, value):
		self.__connected__ = value

	@property
	def http_client(self):
		"""
		@type: AsyncHTTPClient
		"""
		return self.__http_client__

	def data_received(self, chunk):
		pass

	def on_message(self, json_message):
		try:
			if not self.connected:
				raise ValidationError('Skipping message %s, as websocket is not initialized yet' % json_message)
			if not json_message:
				raise Exception('Skipping null message')
			# self.anti_spam.check_spam(json_message)
			self.logger.debug('<< %.1000s', json_message)
			message = json.loads(json_message)
			if message[VarNames.EVENT] not in self.process_ws_message:
				raise Exception("event {} is unknown".format(message[VarNames.EVENT]))
			channel = message.get(VarNames.ROOM_ID)
			if channel and channel not in self.channels:
				raise ValidationError('Access denied for channel {}. Allowed channels: {}'.format(channel, self.channels))
			self.process_ws_message[message[VarNames.EVENT]](message)
		except ValidationError as e:
			error_message = self.default(str(e.message), Actions.GROWL_MESSAGE, HandlerNames.GROWL)
			self.ws_write(error_message)

	def on_close(self):
		if self.async_redis.subscribed:
			self.logger.info("Close event, unsubscribing from %s", self.channels)
			self.async_redis.unsubscribe(self.channels)
		else:
			self.logger.info("Close event, not subscribed, channels: %s", self.channels)
		self.async_redis_publisher.srem(RedisPrefix.ONLINE_VAR, self.id)
		is_online, online = self.get_online_and_status_from_redis()
		if self.connected:
			if not is_online:
				message = self.room_online(online, Actions.LOGOUT)
				self.publish(message, settings.ALL_ROOM_ID)
			res = do_db(execute_query, settings.UPDATE_LAST_READ_MESSAGE, [self.user_id, ])
			self.logger.info("Updated %s last read message", res)
		self.disconnect()

	def disconnect(self, tries=0):
		"""
		Closes a connection if it's not in proggress, otherwice timeouts closing
		https://github.com/evilkost/brukva/issues/25#issuecomment-9468227
		"""
		self.connected = False
		self.closed_channels = self.channels
		self.channels = []
		if self.async_redis.connection.in_progress and tries < 1000:  # failsafe eternal loop
			self.logger.debug('Closing a connection timeouts')
			ioloop.IOLoop.instance().add_timeout(timedelta(0.00001), self.disconnect, tries+1)
		else:
			self.logger.info("Close connection result: %s")
			self.async_redis.disconnect()

	def generate_self_id(self):
		"""
		When user opens new tab in browser wsHandler.wsConnectionId stores Id of current ws
		So if ws loses a connection it still can reconnect with same id,
		and TornadoHandler can restore webrtc_connections to previous state
		"""
		conn_arg = self.get_argument('id', None)
		self.id, random = create_id(self.user_id, conn_arg)
		if random != conn_arg:
			self.restored_connection = False
			self.ws_write(self.set_ws_id(random, self.id))
		else:
			self.restored_connection = True

	def open(self):
		session_key = self.get_cookie(settings.SESSION_COOKIE_NAME)
		if sessionStore.exists(session_key):
			self.ip = self.get_client_ip()
			session = SessionStore(session_key)
			self.user_id = int(session["_auth_user_id"])
			self.generate_self_id()
			self._logger = logging.LoggerAdapter(parent_logger, {
				'id': self.id,
				'ip': self.ip
			})
			cookies = ["{}={}".format(k, self.request.cookies[k].value) for k in self.request.cookies]
			self.logger.debug("!! Incoming connection, session %s, thread hash %s, cookies: %s", session_key, self.id, ";".join(cookies))
			self.async_redis.connect()
			self.async_redis_publisher.sadd(RedisPrefix.ONLINE_VAR, self.id)
			# since we add user to online first, latest trigger will always show correct online
			was_online, online = self.get_online_and_status_from_redis()
			user_db = do_db(User.objects.get, id=self.user_id)
			self.sender_name = user_db.username
			self.sex = user_db.sex_str
			user_rooms1 = Room.objects.filter(users__id=self.user_id, disabled=False)\
				.values('id', 'name', 'roomusers__notifications', 'roomusers__volume')
			user_rooms = MessagesCreator.create_user_rooms(user_rooms1)
			room_ids = [room_id for room_id in user_rooms]
			rooms_users = RoomUsers.objects.filter(room_id__in=room_ids).values('user_id', 'room_id')
			for ru in rooms_users:
				user_rooms[ru['room_id']][VarNames.ROOM_USERS].append(ru['user_id'])
			# get all missed messages
			self.channels = room_ids  # py2 doesn't support clear()
			self.channels.append(self.channel)
			self.channels.append(self.id)
			self.listen(self.channels)
			off_messages, history = self.get_offline_messages(user_rooms, was_online, self.get_argument('history', False))
			for room_id in user_rooms:
				h = history.get(room_id)
				o = off_messages.get(room_id)
				if h:
					user_rooms[room_id][VarNames.LOAD_MESSAGES_HISTORY] = h
				if o:
					user_rooms[room_id][VarNames.LOAD_MESSAGES_OFFLINE] = o
			user_dict = {}
			for user in User.objects.values('id', 'username', 'sex'):
				user_dict[user['id']] = RedisPrefix.set_js_user_structure(user['username'], user['sex'])
			if self.user_id not in online:
				online.append(self.user_id)
			self.ws_write(self.set_room(user_rooms, user_dict, online))
			if not was_online:  # if a new tab has been opened
				online_user_names_mes = self.room_online(online, Actions.LOGIN)
				self.logger.info('!! First tab, sending refresh online for all')
				self.publish(online_user_names_mes, settings.ALL_ROOM_ID)
			self.logger.info("!! User %s subscribes for %s", self.sender_name, self.channels)
			self.connected = True
		else:
			self.logger.warning('!! Session key %s has been rejected', str(session_key))
			self.close(403, "Session key %s has been rejected" % session_key)

	def get_offline_messages(self, user_rooms, was_online, with_history):
		q_objects = get_history_message_query(self.get_argument('messages', None), user_rooms, with_history)
		if was_online:
			off_messages = []
		else:
			off_messages = Message.objects.filter(
				id__gt=F('room__roomusers__last_read_message_id'),
				room__roomusers__user_id=self.user_id
			)
		off = {}
		history = {}
		if len(q_objects.children) > 0:
			history_messages = Message.objects.filter(q_objects)
			all = list(chain(off_messages, history_messages))
			self.logger.info("Offline messages IDs: %s, history messages: %s", [m.id for m in off_messages], [m.id for m in history_messages])
		else:
			history_messages = []
			all = off_messages
		if self.restored_connection:
			off_messages = all
			history_messages = []
		imv = get_message_images_videos(all)
		self.set_video_images_messages(imv, off_messages, off)
		self.set_video_images_messages(imv, history_messages, history)
		return off, history

	def set_video_images_messages(self, imv, inm, outm):
		for message in inm:
			files = MessagesCreator.prepare_img_video(imv, message.id)
			prep_m = self.create_message(message, files)
			outm.setdefault(message.room_id, []).append(prep_m)

	def check_origin(self, origin):
		"""
		check whether browser set domain matches origin
		"""
		parsed_origin = urlparse(origin)
		origin = parsed_origin.netloc
		origin_domain = origin.split(':')[0].lower()
		browser_set = self.request.headers.get("Host")
		browser_domain = browser_set.split(':')[0]
		return browser_domain == origin_domain

	def save_ip(self):
		"""
		This code is not used anymore
		"""
		if not do_db(UserJoinedInfo.objects.filter(
				Q(ip__ip=self.ip) & Q(user_id=self.user_id)).exists):
			res = get_or_create_ip_wrapper(self.ip, self.logger, self.fetch_and_save_ip_http)
			if res is not None:
				UserJoinedInfo.objects.create(ip=res, user_id=self.user_id)

	@asynchronous
	def fetch_and_save_ip_http(self):
		"""
			This code is not used anymore
		"""
		def fetch_response(response):
			try:
				ip_record = create_ip_structure(self.ip, response.body)
			except Exception as e:
				self.logger.error("Error while creating ip with country info, because %s", e)
				ip_record = IpAddress.objects.create(ip=self.ip)
			UserJoinedInfo.objects.create(ip=ip_record, user_id=self.user_id)
		r = HTTPRequest(settings.IP_API_URL % self.ip, method="GET")
		self.http_client.fetch(r, callback=fetch_response)

	def ws_write(self, message):
		"""
		Tries to send message, doesn't throw exception outside
		:type self: MessagesHandler
		:type message object
		"""
		# self.logger.debug('<< THREAD %s >>', os.getppid())
		try:
			if isinstance(message, dict):
				message = json.dumps(message)
			if not isinstance(message, str_type):
				raise ValueError('Wrong message type : %s' % str(message))
			self.logger.debug(">> %.1000s", message)
			self.write_message(message)
		except WebSocketClosedError as e:
			self.logger.warning("%s. Can't send message << %s >> ", e, str(message))

	def get_client_ip(self):
		return self.request.headers.get("X-Real-IP") or self.request.remote_ip