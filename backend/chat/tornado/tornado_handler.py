import json
import logging
from datetime import timedelta

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db.models import F, Q, Count, Prefetch
from itertools import chain
from tornado import ioloop, gen
from tornado.websocket import WebSocketHandler, WebSocketClosedError

from chat.models import User, Message, UserJoinedInfo, Room, RoomUsers, UserProfile, Channel, get_milliseconds, \
	IpAddress
from chat.tornado.anti_spam import AntiSpam
from chat.tornado.constants import VarNames, HandlerNames, Actions, RedisPrefix
from chat.tornado.message_creator import MessagesCreator, WebRtcMessageCreator
from chat.tornado.message_handler import MessagesHandler, WebRtcMessageHandler
from chat.utils import create_id, get_or_create_ip_model, get_thumbnail_url

parent_logger = logging.getLogger(__name__)


class Error401(Exception):
	pass


class TornadoHandler(WebSocketHandler, WebRtcMessageHandler):

	def __init__(self, *args, **kwargs):
		super(TornadoHandler, self).__init__(*args, **kwargs)
		self.__connected__ = False
		self.restored_connection = False
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
		message = None
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
			error_message = self.message_creator.default(str(e.message), Actions.GROWL_ERROR_MESSAGE, HandlerNames.WS)
			if message:
				error_message[VarNames.JS_MESSAGE_ID] = message.get(VarNames.JS_MESSAGE_ID, None)
			self.ws_write(error_message)

	def on_close(self):
		if self.async_redis.subscribed:
			self.logger.info("Close event, unsubscribing from %s", self.channels)
			self.async_redis.unsubscribe(self.channels)
		else:
			self.logger.info("Close event, not subscribed, channels: %s", self.channels)
		self.async_redis_publisher.srem(RedisPrefix.ONLINE_VAR, self.id)
		online = self.get_dict_users_from_redis()
		my_online = online.setdefault(self.user_id, [])
		if self.id in my_online:
			my_online.remove(self.id)
		if self.connected:
			message = self.message_creator.room_online_logout(online)
			self.publish(message, settings.ALL_ROOM_ID)
			UserProfile.objects.filter(id=self.user_id).update(last_time_online=get_milliseconds())
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
		if conn_arg:
			random = conn_arg.split(":")[1]
		else:
			random = None
		self.id, random = create_id(self.user_id, random)
		self.restored_connection = random == conn_arg
		self.restored_connection = False

	def open(self):
		session_key = self.get_argument('sessionId', None)
		user_id = self.sync_redis.hget('sessions', session_key)
		if user_id is None:
			self.logger.warning('!! Session key %s has been rejected' % session_key)
			self.close(403, "Session key %s has been rejected" % session_key)
			return
		self.user_id = int(user_id)
		try:
			user_db = UserProfile.objects.get(id=self.user_id)
		except UserProfile.DoesNotExist:
			self.logger.warning('Database has been cleared, but redis %s not. Logging out current user' % session_key)
			self.close(403, "This user no more longer exists")
			return
		self.ip = self.get_client_ip()
		self.generate_self_id()
		self.save_ip()
		self.message_creator = WebRtcMessageCreator(self.user_id, self.id)
		self._logger = logging.LoggerAdapter(parent_logger, {
			'id': self.id,
			'ip': self.ip
		})
		self.logger.debug("!! Incoming connection, session %s, thread hash %s", session_key, self.id)
		self.async_redis.connect()
		self.async_redis_publisher.sadd(RedisPrefix.ONLINE_VAR, self.id)
		# since we add user to online first, latest trigger will always show correct online

		online = self.get_dict_users_from_redis()
		# current user is already online
		my_online = online.setdefault(self.user_id, [])
		if self.id not in my_online:
			my_online.append(self.id)

		user_rooms_query = Room.objects.filter(users__id=self.user_id, disabled=False) \
			.values('id', 'name', 'creator_id', 'is_main_in_channel', 'channel_id', 'p2p', 'roomusers__notifications', 'roomusers__volume')
		room_users = [{
			VarNames.ROOM_ID: room['id'],
			VarNames.ROOM_NAME: room['name'],
			VarNames.CHANNEL_ID: room['channel_id'],
			VarNames.ROOM_CREATOR_ID: room['creator_id'],
			VarNames.IS_MAIN_IN_CHANNEL: room['is_main_in_channel'],
			VarNames.NOTIFICATIONS: room['roomusers__notifications'],
			VarNames.P2P: room['p2p'],
			VarNames.VOLUME: room['roomusers__volume'],
			VarNames.ROOM_USERS: []
		} for room in user_rooms_query]
		user_rooms_dict = {room[VarNames.ROOM_ID]: room for room in room_users}
		channels_ids = [channel[VarNames.CHANNEL_ID] for channel in room_users if channel[VarNames.CHANNEL_ID]]
		channels_db = Channel.objects.filter(Q(id__in=channels_ids) | Q(creator=self.user_id), disabled=False)
		channels = [{
			VarNames.CHANNEL_ID: channel.id,
			VarNames.CHANNEL_NAME: channel.name,
			VarNames.CHANNEL_CREATOR_ID: channel.creator_id
		} for channel in channels_db]
		room_ids = [room_id[VarNames.ROOM_ID] for room_id in room_users]
		rooms_users = RoomUsers.objects.filter(room_id__in=room_ids).values('user_id', 'room_id')
		for ru in rooms_users:
			user_rooms_dict[ru['room_id']][VarNames.ROOM_USERS].append(ru['user_id'])
		# get all missed messages
		self.channels = room_ids  # py2 doesn't support clear()
		self.channels.append(self.channel)
		self.channels.append(self.id)
		self.listen(self.channels)
		# this was replaced to syncHistory method that's called from browser and passes existing ids
		# off_messages, history = self.get_offline_messages(room_users, was_online, self.get_argument('history', False))
		# for room in room_users:
		# 	room_id = room[VarNames.ROOM_ID]
		# 	h = history.get(room_id)
		# 	o = off_messages.get(room_id)
		# 	if h:
		# 		room[VarNames.LOAD_MESSAGES_HISTORY] = h
		# 	if o:
		# 		room[VarNames.LOAD_MESSAGES_OFFLINE] = o


		fetched_users = User.objects.values('id', 'username', 'sex', 'thumbnail')
		user_dict = [RedisPrefix.set_js_user_structure(
			user['id'],
			user['username'],
			user['sex'],
			get_thumbnail_url(user['thumbnail'])
		) for user in fetched_users]

		self.ws_write(self.message_creator.set_room(room_users, user_dict, online, user_db, channels))
		online_user_names_mes = self.message_creator.room_online_login(online)
		self.logger.info('!! First tab, sending refresh online for all')
		self.publish(online_user_names_mes, settings.ALL_ROOM_ID)
		self.logger.info("!! User %s subscribes for %s", self.user_id, self.channels)
		self.connected = True

	# def get_offline_messages(self, user_rooms, was_online, with_history):
	# 	q_objects = get_history_message_query(self.get_argument('messages', None), user_rooms, with_history)
	# 	if was_online:
	# 		off_messages = []
	# 	else:
	# 		off_messages = Message.objects.filter(
	# 			id__gt=F('room__roomusers__last_read_message_id'),
	# 			room__roomusers__user_id=self.user_id
	# 		)
	# 	off = {}
	# 	history = {}
	# 	if len(q_objects.children) > 0:
	# 		history_messages = Message.objects.filter(q_objects)
	# 		all = list(chain(off_messages, history_messages))
	# 		self.logger.info("Offline messages IDs: %s, history messages: %s", [m.id for m in off_messages], [m.id for m in history_messages])
	# 	else:
	# 		history_messages = []
	# 		all = off_messages
	# 	if self.restored_connection:
	# 		off_messages = all
	# 		history_messages = []
	# 	imv = get_message_images_videos(all)
	# 	self.set_video_images_messages(imv, off_messages, off)
	# 	self.set_video_images_messages(imv, history_messages, history)
	# 	return off, history

	def check_origin(self, origin):
		"""
		check whether browser set domain matches origin
		"""
		return True # we don't use cookies

	@gen.coroutine
	def save_ip(self):
		"""
		This code is not used anymore
		"""
		if not UserJoinedInfo.objects.filter(
				Q(ip__ip=self.ip) & Q(user_id=self.user_id)).exists():
			ip = yield from get_or_create_ip_model(self.ip, self.logger)
			UserJoinedInfo.objects.create(ip=ip, user_id=self.user_id)

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
			if not isinstance(message, str):
				raise ValueError('Wrong message type : %s' % str(message))
			self.logger.debug(">> %.1000s", message)
			self.write_message(message)
		except WebSocketClosedError as e:
			self.logger.warning("%s. Can't send message << %s >> ", e, str(message))

	def get_client_ip(self):
		return self.request.headers.get("X-Real-IP") or self.request.remote_ip
