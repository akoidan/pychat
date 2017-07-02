import json
import logging
from datetime import timedelta
from numbers import Number
from threading import Thread

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db.models import F, Q
from redis_sessions.session import SessionStore
from tornado import ioloop
from tornado.websocket import WebSocketHandler, WebSocketClosedError

from chat.cookies_middleware import create_id
from chat.models import User, Message, UserJoinedInfo
from chat.py2_3 import str_type, urlparse
from chat.settings import UPDATE_LAST_READ_MESSAGE
from chat.tornado.anti_spam import AntiSpam
from chat.tornado.constants import VarNames, HandlerNames, Actions
from chat.tornado.image_utils import get_message_images, prepare_img
from chat.tornado.message_handler import MessagesHandler
from chat.utils import execute_query, do_db, get_or_create_ip, get_users_in_current_user_rooms

sessionStore = SessionStore()

parent_logger = logging.getLogger(__name__)


class TornadoHandler(WebSocketHandler, MessagesHandler):

	def __init__(self, *args, **kwargs):
		super(TornadoHandler, self).__init__(*args, **kwargs)
		self.__connected__ = False
		self.anti_spam = AntiSpam()

	@property
	def connected(self):
		return self.__connected__

	@connected.setter
	def connected(self, value):
		self.__connected__ = value

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
			if message[VarNames.EVENT] not in self.pre_process_message:
				raise Exception("event {} is unknown".format(message[VarNames.EVENT]))
			channel = message.get(VarNames.CHANNEL)
			if channel and channel not in self.channels:
				raise Exception('Access denied for channel {}. Allowed channels: {}'.format(channel, self.channels))
			self.pre_process_message[message[VarNames.EVENT]](message)
		except ValidationError as e:
			error_message = self.default(str(e.message), Actions.GROWL_MESSAGE, HandlerNames.GROWL)
			self.ws_write(error_message)

	def publish_logout(self, channel, log_data):
		# seems like async solves problem with connection lost and wrong data status
		# http://programmers.stackexchange.com/questions/294663/how-to-store-online-status
		is_online, online = self.get_online_and_status_from_redis(channel)
		log_data[channel] = {'online': online, 'is_online': is_online}
		if not is_online:
			message = self.room_online(online, Actions.LOGOUT, channel)
			self.publish(message, channel)
			return True

	def on_close(self):
		if self.async_redis.subscribed:
			self.logger.info("Close event, unsubscribing from %s", self.channels)
			self.async_redis.unsubscribe(self.channels)
		else:
			self.logger.info("Close event, not subscribed, channels: %s", self.channels)
		log_data = {}
		gone_offline = False
		for channel in self.channels:
			if not isinstance(channel, Number):
				continue
			self.sync_redis.srem(channel, self.id)
			if self.connected:
				gone_offline = self.publish_logout(channel, log_data) or gone_offline
		if gone_offline:
			res = do_db(execute_query, UPDATE_LAST_READ_MESSAGE, [self.user_id, ])
			self.logger.info("Updated %s last read message", res)
		self.disconnect(json.dumps(log_data))

	def disconnect(self, log_data, tries=0):
		"""
		Closes a connection if it's not in proggress, otherwice timeouts closing
		https://github.com/evilkost/brukva/issues/25#issuecomment-9468227
		"""
		self.connected = False
		self.closed_channels = self.channels
		self.channels = []
		if self.async_redis.connection.in_progress and tries < 1000:  # failsafe eternal loop
			self.logger.debug('Closing a connection timeouts')
			ioloop.IOLoop.instance().add_timeout(timedelta(0.00001), self.disconnect, log_data, tries+1)
		else:
			self.logger.info("Close connection result: %s", log_data)
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
			self.ws_write(self.set_ws_id(random, self.id))

	def open(self):
		session_key = self.get_cookie(settings.SESSION_COOKIE_NAME)
		if sessionStore.exists(session_key):
			self.ip = self.get_client_ip()
			session = SessionStore(session_key)
			self.user_id = int(session["_auth_user_id"])
			self.generate_self_id()
			log_params = {
				'id': self.id,
				'ip': self.ip
			}
			self._logger = logging.LoggerAdapter(parent_logger, log_params)
			self.logger.debug("!! Incoming connection, session %s, thread hash %s", session_key, self.id)
			self.async_redis.connect()
			user_db = do_db(User.objects.get, id=self.user_id)
			self.sender_name = user_db.username
			self.sex = user_db.sex_str
			user_rooms = get_users_in_current_user_rooms(self.user_id)
			self.ws_write(self.default(user_rooms, Actions.ROOMS, HandlerNames.CHANNELS))
			# get all missed messages
			self.channels = []  # py2 doesn't support clear()
			self.channels.append(self.channel)
			self.channels.append(self.id)
			for room_id in user_rooms:
				self.channels.append(room_id)
			self.listen(self.channels)
			off_messages = self.get_offline_messages()
			for room_id in user_rooms:
				self.add_online_user(room_id, off_messages.get(room_id))
			self.logger.info("!! User %s subscribes for %s", self.sender_name, self.channels)
			self.connected = True
			Thread(target=self.save_ip).start()
		else:
			self.logger.warning('!! Session key %s has been rejected', str(session_key))
			self.close(403, "Session key %s has been rejected" % session_key)

	def get_offline_messages(self):
		res = {}
		off_mess = Message.objects.filter(
			id__gt=F('room__roomusers__last_read_message_id'),
			deleted=False,
			room__roomusers__user_id=self.user_id
		)
		images = do_db(get_message_images, off_mess)
		for message in off_mess:
			prep_m = self.create_message(message, prepare_img(images, message.id))
			res.setdefault(message.room_id, []).append(prep_m)
		return res

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
		if (do_db(UserJoinedInfo.objects.filter(
					Q(ip__ip=self.ip) & Q(user_id=self.user_id)).exists)):
			return
		ip_address = get_or_create_ip(self.ip, self.logger)
		UserJoinedInfo.objects.create(
			ip=ip_address,
			user_id=self.user_id
		)

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
			self.logger.error("%s. Can't send << %s >> message", e, str(message))

	def get_client_ip(self):
		return self.request.headers.get("X-Real-IP") or self.request.remote_ip