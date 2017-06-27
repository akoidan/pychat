import json
import logging
import sys
import time
from datetime import timedelta
from numbers import Number
from threading import Thread

import tornado.gen
import tornado.httpclient
import tornado.web
import tornado.websocket
import tornadoredis
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import connection, OperationalError, InterfaceError, IntegrityError
from django.db.models import Q, F
from redis_sessions.session import SessionStore
from tornado import ioloop
from tornado.websocket import WebSocketHandler

from chat.cookies_middleware import create_id
from chat.log_filters import id_generator
from chat.utils import extract_photo
from chat.utils import get_or_create_ip

try:  # py2
	from urlparse import urlparse
except ImportError:  # py3
	from urllib.parse import urlparse

from chat.settings import MAX_MESSAGE_SIZE, ALL_ROOM_ID, GENDERS, UPDATE_LAST_READ_MESSAGE, SELECT_SELF_ROOM, \
	TORNADO_REDIS_PORT, WEBRTC_CONNECTION
from chat.models import User, Message, Room, get_milliseconds, UserJoinedInfo, RoomUsers

PY3 = sys.version > '3'
str_type = str if PY3 else basestring


sessionStore = SessionStore()

parent_logger = logging.getLogger(__name__)
base_logger = logging.LoggerAdapter(parent_logger, {
	'id': 0,
	'ip': '000.000.000.000'
})

# TODO https://github.com/leporo/tornado-redis#connection-pool-support
#CONNECTION_POOL = tornadoredis.ConnectionPool(
#	max_connections=500,
#	wait_for_available=True)


class Actions(object):
	LOGIN = 'addOnlineUser'
	SET_WS_ID = 'setWsId'
	LOGOUT = 'removeOnlineUser'
	SEND_MESSAGE = 'sendMessage'
	PRINT_MESSAGE = 'printMessage'
	WEBRTC = 'sendRtcData'
	CLOSE_WEBRTC = 'destroyConnection'
	ACCEPT_CALL = 'acceptCall'
	ACCEPT_FILE = 'acceptFile'
	ROOMS = 'setRooms'
	REFRESH_USER = 'setOnlineUsers'
	GROWL_MESSAGE = 'growl'
	GET_MESSAGES = 'loadMessages'
	CREATE_DIRECT_CHANNEL = 'addDirectChannel'
	DELETE_ROOM = 'deleteRoom'
	EDIT_MESSAGE = 'editMessage'
	DELETE_MESSAGE = 'deleteMessage'
	CREATE_ROOM_CHANNEL = 'addRoom'
	INVITE_USER = 'inviteUser'
	ADD_USER = 'addUserToAll'
	OFFLINE_MESSAGES = 'loadOfflineMessages'
	SET_WEBRTC_ID = 'setConnectionId'
	SET_WEBRTC_ERROR = 'setError'
	OFFER_FILE_CONNECTION = 'offerFile'
	OFFER_CALL_CONNECTION = 'offerCall'
	REPLY_FILE_CONNECTION = 'replyFile'
	REPLY_CALL_CONNECTION = 'replyCall'


class VarNames(object):
	WEBRTC_QUED_ID = 'id'
	USER = 'user'
	USER_ID = 'userId'
	TIME = 'time'
	CONTENT = 'content'
	IMG = 'image'
	EVENT = 'action'
	MESSAGE_ID = 'id'
	GENDER = 'sex'
	ROOM_NAME = 'name'
	FILE_NAME = 'filename'
	ROOM_ID = 'roomId'
	ROOM_USERS = 'users'
	CHANNEL = 'channel'
	WEBRTC_OPPONENT_ID = 'opponentWsId'
	GET_MESSAGES_COUNT = 'count'
	GET_MESSAGES_HEADER_ID = 'headerId'
	CHANNEL_NAME = 'channel'
	IS_ROOM_PRIVATE = 'private'
	CONNECTION_ID = 'connId'
	HANDLER_NAME = 'handler'


class HandlerNames:
	CHANNELS = 'channels'
	CHAT = 'chat'
	GROWL = 'growl'
	WEBRTC = 'webrtc'
	PEER_CONNECTION = 'peerConnection'
	WEBRTC_TRANSFER = 'webrtcTransfer'
	WS = 'ws'


class WebRtcRedisStates:
	RESPONDED = 'responded'
	READY = 'ready'
	OFFERED = 'offered'
	CLOSED = 'closed'


class RedisPrefix:
	USER_ID_CHANNEL_PREFIX = 'u'
	DEFAULT_CHANNEL = ALL_ROOM_ID
	CONNECTION_ID_LENGTH = 8  # should be secure

	@classmethod
	def generate_user(cls, key):
		return cls.USER_ID_CHANNEL_PREFIX + str(key)


class MessagesCreator(object):

	def __init__(self, *args, **kwargs):
		self.sex = None
		self.sender_name = None
		self.id = None  # child init
		self.user_id = 0  # anonymous by default

	def default(self, content, event, handler):
		"""
		:return: {"action": event, "content": content, "time": "20:48:57"}
		"""
		return {
			VarNames.EVENT: event,
			VarNames.CONTENT: content,
			VarNames.USER_ID: self.user_id,
			VarNames.TIME: get_milliseconds(),
			VarNames.HANDLER_NAME: handler
		}

	def reply_webrtc(self, event, connection_id):
		"""
		:return: {"action": event, "content": content, "time": "20:48:57"}
		"""
		return {
			VarNames.EVENT: event,
			VarNames.CONNECTION_ID: connection_id,
			VarNames.USER_ID: self.user_id,
			VarNames.USER: self.sender_name,
			VarNames.WEBRTC_OPPONENT_ID: self.id,
			VarNames.HANDLER_NAME: HandlerNames.WEBRTC_TRANSFER,
		}

	def set_ws_id(self, random):
		return {
			VarNames.HANDLER_NAME: HandlerNames.WS,
			VarNames.EVENT: Actions.SET_WS_ID,
			VarNames.CONTENT: random
		}

	def room_online(self, online, event, channel):
		"""
		:return: {"action": event, "content": content, "time": "20:48:57"}
		"""
		room_less = self.default(online, event, HandlerNames.CHAT)
		room_less[VarNames.CHANNEL_NAME] = channel
		room_less[VarNames.USER] = self.sender_name
		room_less[VarNames.GENDER] = self.sex
		return room_less

	def offer_webrtc(self, content, connection_id, room_id, action):
		"""
		:return: {"action": "call", "content": content, "time": "20:48:57"}
		"""
		message = self.default(content, action, HandlerNames.WEBRTC)
		message[VarNames.USER] = self.sender_name
		message[VarNames.CONNECTION_ID] = connection_id
		message[VarNames.WEBRTC_OPPONENT_ID] = self.id
		message[VarNames.CHANNEL] = room_id
		return message

	def set_connection_id(self, qued_id, connection_id):
		return {
			VarNames.EVENT: Actions.SET_WEBRTC_ID,
			VarNames.HANDLER_NAME: HandlerNames.WEBRTC,
			VarNames.CONNECTION_ID: connection_id,
			VarNames.WEBRTC_QUED_ID: qued_id
		}

	def set_webrtc_error(self, error, connection_id, qued_id=None):
		message = self.default(error, Actions.SET_WEBRTC_ERROR, HandlerNames.PEER_CONNECTION) # TODO file/call
		message[VarNames.CONNECTION_ID] = connection_id
		if qued_id:
			message[VarNames.WEBRTC_QUED_ID] = qued_id
		return message

	@classmethod
	def create_message(cls, message):
		res = {
			VarNames.USER_ID: message.sender_id,
			VarNames.CONTENT: message.content,
			VarNames.TIME: message.time,
			VarNames.MESSAGE_ID: message.id,
		}
		if message.img.name:
			res[VarNames.IMG] = message.img.url
		return res

	@classmethod
	def create_send_message(cls, message, event=Actions.PRINT_MESSAGE):
		"""
		:param message:
		:return: "action": "joined", "content": {"v5bQwtWp": "alien", "tRD6emzs": "Alien"},
		"sex": "Alien", "user": "tRD6emzs", "time": "20:48:57"}
		"""
		res = cls.create_message(message)
		res[VarNames.EVENT] = event
		res[VarNames.CHANNEL] = message.room_id
		res[VarNames.HANDLER_NAME] = HandlerNames.CHAT
		return res

	@classmethod
	def get_messages(cls, messages, channel):
		"""
		:type messages: list[Messages]
		:type channel: str
		:type messages: QuerySet[Messages]
		"""
		return {
			VarNames.CONTENT: [cls.create_message(message) for message in messages],
			VarNames.EVENT: Actions.GET_MESSAGES,
			VarNames.CHANNEL: channel,
			VarNames.HANDLER_NAME: HandlerNames.CHAT
		}

	@property
	def channel(self):
		return RedisPrefix.generate_user(self.user_id)

	def subscribe_direct_channel_message(self, room_id, other_user_id):
		return {
			VarNames.EVENT: Actions.CREATE_DIRECT_CHANNEL,
			VarNames.ROOM_ID: room_id,
			VarNames.ROOM_USERS: [self.user_id, other_user_id],
			VarNames.HANDLER_NAME: HandlerNames.CHANNELS
		}

	def subscribe_room_channel_message(self, room_id, room_name):
		return {
			VarNames.EVENT: Actions.CREATE_ROOM_CHANNEL,
			VarNames.ROOM_ID: room_id,
			VarNames.ROOM_USERS: [self.user_id],
			VarNames.HANDLER_NAME: HandlerNames.CHANNELS,
			VarNames.ROOM_NAME: room_name
		}

	def invite_room_channel_message(self, room_id, user_id, room_name, users):
		return {
			VarNames.EVENT: Actions.INVITE_USER,
			VarNames.ROOM_ID: room_id,
			VarNames.USER_ID: user_id,
			VarNames.HANDLER_NAME: HandlerNames.CHANNELS,
			VarNames.ROOM_NAME: room_name,
			VarNames.CONTENT: users
		}

	def add_user_to_room(self, channel, user_id, content):
		return {
			VarNames.EVENT: Actions.ADD_USER,
			VarNames.CHANNEL: channel,
			VarNames.USER_ID: user_id,
			VarNames.HANDLER_NAME: HandlerNames.CHAT,
			VarNames.GENDER: content[VarNames.GENDER], # SEX: 'Alien', USER: 'Andrew'
			VarNames.USER: content[VarNames.USER] # SEX: 'Alien', USER: 'Andrew'
		}

	def unsubscribe_direct_message(self, room_id):
		return {
			VarNames.EVENT: Actions.DELETE_ROOM,
			VarNames.ROOM_ID: room_id,
			VarNames.USER_ID: self.user_id,
			VarNames.HANDLER_NAME: HandlerNames.CHANNELS,
			VarNames.TIME: get_milliseconds()
		}

	def load_offline_message(self, offline_messages, channel_key):
		res = self.default(offline_messages, Actions.OFFLINE_MESSAGES, HandlerNames.CHAT)
		res[VarNames.CHANNEL] = channel_key
		return res


class MessagesHandler(MessagesCreator):

	def __init__(self, *args, **kwargs):
		self.closed_channels = None
		self.parsable_prefix = 'p'
		super(MessagesHandler, self).__init__(*args, **kwargs)
		self.webrtc_ids = {}
		self.ip = None
		from chat import global_redis
		self.async_redis_publisher = global_redis.async_redis_publisher
		self.sync_redis = global_redis.sync_redis
		self.channels = []
		self._logger = None
		self.async_redis = tornadoredis.Client(port=TORNADO_REDIS_PORT)
		self.patch_tornadoredis()
		self.pre_process_message = {
			Actions.GET_MESSAGES: self.process_get_messages,
			Actions.SEND_MESSAGE: self.process_send_message,
			Actions.WEBRTC: self.proxy_webrtc,
			Actions.CLOSE_WEBRTC: self.close_and_proxy_connection,
			Actions.ACCEPT_CALL: self.accept_call_and_proxy_connection,
			Actions.ACCEPT_FILE: self.accept_file_and_proxy_connection,
			Actions.CREATE_DIRECT_CHANNEL: self.create_user_channel,
			Actions.DELETE_ROOM: self.delete_channel,
			Actions.EDIT_MESSAGE: self.edit_message,
			Actions.CREATE_ROOM_CHANNEL: self.create_new_room,
			Actions.INVITE_USER: self.invite_user,
			Actions.OFFER_FILE_CONNECTION: self.offer_webrtc_connection,
			Actions.OFFER_CALL_CONNECTION: self.offer_webrtc_connection,
			Actions.REPLY_FILE_CONNECTION: self.reply_file_connection,
			Actions.REPLY_CALL_CONNECTION: self.reply_call_connection,
		}
		self.post_process_message = {
			Actions.CREATE_DIRECT_CHANNEL: self.send_client_new_channel,
			Actions.CREATE_ROOM_CHANNEL: self.send_client_new_channel,
			Actions.DELETE_ROOM: self.send_client_delete_channel,
			Actions.INVITE_USER: self.send_client_new_channel,
			Actions.OFFER_FILE_CONNECTION: self.set_opponent_call_channel,
			Actions.OFFER_CALL_CONNECTION: self.set_opponent_call_channel
		}

	def patch_tornadoredis(self):  # TODO remove this
		fabric = type(self.async_redis.connection.readline)
		self.async_redis.connection.old_read = self.async_redis.connection.readline
		def new_read(new_self, callback=None):
			try:
				return new_self.old_read(callback=callback)
			except Exception as e:
				current_online = self.get_online_from_redis(RedisPrefix.DEFAULT_CHANNEL)
				self.logger.error(e)
				self.logger.error(
					"Exception info: "
					"self.id: %s ;;; "
					"self.connected = '%s';;; "
					"Redis default channel online = '%s';;; "
					"self.channels = '%s';;; "
					"self.closed_channels  = '%s';;;",
					self.id, self.connected, current_online, self.channels, self.closed_channels
				)
				raise e

		self.async_redis.connection.readline = fabric(new_read, self.async_redis.connection)

	@property
	def connected(self):
		raise NotImplemented

	@connected.setter
	def connected(self, value):
		raise NotImplemented

	@tornado.gen.engine
	def listen(self, channels):
		yield tornado.gen.Task(
			self.async_redis.subscribe, channels)
		self.async_redis.listen(self.pub_sub_message)

	@property
	def logger(self):
		return self._logger if self._logger else base_logger

	@tornado.gen.engine
	def add_channel(self, channel):
		self.channels.append(channel)
		yield tornado.gen.Task(
			self.async_redis.subscribe, (channel,))

	def evaluate(self, query_set):
		self.do_db(len, query_set)
		return query_set

	def do_db(self, callback, *args, **kwargs):
		try:
			return callback(*args, **kwargs)
		except (OperationalError, InterfaceError) as e:
			if 'MySQL server has gone away' in str(e):
				self.logger.warning('%s, reconnecting' % e)
				connection.close()
				return callback(*args, **kwargs)
			else:
				raise e

	def execute_query(self, query, *args, **kwargs):
		cursor = connection.cursor()
		cursor.execute(query, *args, **kwargs)
		desc = cursor.description
		return [
			dict(zip([col[0] for col in desc], row))
			for row in cursor.fetchall()
			]

	def get_online_from_redis(self, channel, check_self_online=False):
		"""
		:rtype : dict
		returns (dict, bool) if check_type is present
		"""
		online = self.sync_redis.smembers(channel)
		self.logger.debug('!! channel %s redis online: %s', channel, online)
		result = set()
		user_is_online = False
		# redis stores8 REDIS_USER_FORMAT, so parse them
		if online:
			for raw in online:  # py2 iteritems
				decoded = raw.decode('utf-8')
				# : char specified in cookies_middleware.py.create_id
				user_id = int(decoded.split(':')[0])
				if user_id == self.user_id and decoded != self.id:
					user_is_online = True
				result.add(user_id)
		result = list(result)
		return (result, user_is_online) if check_self_online else result

	def add_online_user(self, room_id, offline_messages=None):
		"""
		adds to redis
		online_users = { connection_hash1 = stored_redis_user1, connection_hash_2 = stored_redis_user2 }
		:return:
		"""
		self.async_redis_publisher.sadd(room_id, self.id)
		# since we add user to online first, latest trigger will always show correct online
		online, is_online = self.get_online_from_redis(room_id, True)
		if not is_online:  # if a new tab has been opened
			online.append(self.user_id)
			online_user_names_mes = self.room_online(
				online,
				Actions.LOGIN,
				room_id
			)
			self.logger.info('!! First tab, sending refresh online for all')
			self.publish(online_user_names_mes, room_id)
			if offline_messages:
				self.ws_write(self.load_offline_message(offline_messages, room_id))
		else:  # Send user names to self
			online_user_names_mes = self.room_online(
				online,
				Actions.REFRESH_USER,
				room_id
			)
			self.logger.info('!! Second tab, retrieving online for self')
			self.ws_write(online_user_names_mes)

	def publish(self, message, channel, parsable=False):
		jsoned_mess = json.dumps(message)
		self.logger.debug('<%s> %s', channel, jsoned_mess)
		if parsable:
			jsoned_mess = self.encode(jsoned_mess)
		self.async_redis_publisher.publish(channel, jsoned_mess)

	def encode(self, message):
		"""
		Marks message with prefix to specify that
		it should be decoded and proccesed before sending to client
		@param message: message to mark
		@return: marked message
		"""
		return self.parsable_prefix + message

	def remove_parsable_prefix(self, message):
		if message.startswith(self.parsable_prefix):
			return message[1:]

	def pub_sub_message(self, message):
		data = message.body
		if isinstance(data, str_type):  # subscribe event
			prefixless_str = self.remove_parsable_prefix(data)
			if prefixless_str:
				dict_message = json.loads(prefixless_str)
				res = self.post_process_message[dict_message[VarNames.EVENT]](dict_message)
				if not res:
					self.ws_write(prefixless_str)
			else:
				self.ws_write(data)

	def ws_write(self, message):
		raise NotImplementedError('WebSocketHandler implements')

	def process_send_message(self, message):
		"""
		:type message: dict
		"""
		channel = message[VarNames.CHANNEL]
		message_db = Message(
			sender_id=self.user_id,
			content=message[VarNames.CONTENT]
		)
		message_db.room_id = channel
		if VarNames.IMG in message:
			message_db.img = extract_photo(message[VarNames.IMG], message.get(VarNames.FILE_NAME))
		self.do_db(message_db.save)  # exit on hacked id with exception
		prepared_message = self.create_send_message(message_db)
		self.publish(prepared_message, channel)

	def close_and_proxy_connection(self, in_message):
		connection_id = in_message[VarNames.CONNECTION_ID]
		self_channel_status = self.sync_redis.shget(connection_id, self.id)
		if not self_channel_status:
			raise Exception("Access Denied")
		if self_channel_status != 'closed':
			sender_id = self.sync_redis.shget(WEBRTC_CONNECTION, connection_id)
			if sender_id == self.id:
				self.close_sender(connection_id)
			else:
				self.close_receiver(connection_id, in_message, sender_id)
			self.async_redis_publisher.hset(connection_id, self.id, WebRtcRedisStates.CLOSED)

	def close_receiver(self, connection_id, in_message, sender_id): # TODO for call we should close all
		sender_status = self.sync_redis.shget(connection_id, sender_id)
		if not sender_status:
			raise Exception("Access denied")
		if sender_status != WebRtcRedisStates.CLOSED:
			in_message[VarNames.WEBRTC_OPPONENT_ID] = self.id
			in_message[VarNames.HANDLER_NAME] = HandlerNames.PEER_CONNECTION
			self.publish(in_message, sender_id)

	def close_sender(self, connection_id):
		values = self.sync_redis.shgetall(connection_id)
		del values[self.id]
		for ws_id in values:
			if values[ws_id] == WebRtcRedisStates.CLOSED:
				continue
			self.publish({
				VarNames.EVENT: Actions.CLOSE_WEBRTC,
				VarNames.CONNECTION_ID: connection_id,
				VarNames.WEBRTC_OPPONENT_ID: self.id,
				VarNames.HANDLER_NAME: HandlerNames.WEBRTC_TRANSFER,
			}, ws_id)

	def accept_file_and_proxy_connection(self, in_message):
		connection_id = in_message[VarNames.CONNECTION_ID] # TODO accept all if call
		sender_ws_id = self.sync_redis.shget(WEBRTC_CONNECTION, connection_id)
		sender_ws_status = self.sync_redis.shget(connection_id, sender_ws_id)
		self_ws_status = self.sync_redis.shget(connection_id, self.id)
		if sender_ws_status == WebRtcRedisStates.READY and self_ws_status == WebRtcRedisStates.RESPONDED:
			self.async_redis_publisher.hset(connection_id, self.id, WebRtcRedisStates.READY)
			self.publish({
				VarNames.EVENT: Actions.ACCEPT_FILE,
				VarNames.CONNECTION_ID: connection_id,
				VarNames.WEBRTC_OPPONENT_ID: self.id,
				VarNames.HANDLER_NAME: HandlerNames.PEER_CONNECTION,
			}, sender_ws_id)
		else:
			raise ValidationError("Invalid channel status")

	def accept_call_and_proxy_connection(self, in_message):
		connection_id = in_message[VarNames.CONNECTION_ID]
		channel_status = self.sync_redis.shgetall(connection_id)
		if channel_status and channel_status[self.id] == WebRtcRedisStates.RESPONDED:
			self.async_redis_publisher.hset(connection_id, self.id, WebRtcRedisStates.READY)
			for key in channel_status:  # del channel_status[self.id] not needed as self in responded
				if channel_status[key] == WebRtcRedisStates.READY:
					self.publish({
						VarNames.EVENT: Actions.ACCEPT_CALL,
						VarNames.CONNECTION_ID: connection_id,
						VarNames.WEBRTC_OPPONENT_ID: self.id,
						VarNames.HANDLER_NAME: HandlerNames.WEBRTC_TRANSFER,
					}, key)
		else:
			raise ValidationError("Invalid channel status")

	def offer_webrtc_connection(self, in_message):
		room_id = in_message[VarNames.CHANNEL]
		content = in_message.get(VarNames.CONTENT)
		qued_id = in_message[VarNames.WEBRTC_QUED_ID]
		connection_id = id_generator(RedisPrefix.CONNECTION_ID_LENGTH)
		# use list because sets dont have 1st element which is offerer
		self.async_redis_publisher.hset(WEBRTC_CONNECTION, connection_id, self.id)
		self.async_redis_publisher.hset(connection_id, self.id, WebRtcRedisStates.READY)
		opponents_message = self.offer_webrtc(content, connection_id, room_id, in_message[VarNames.EVENT])
		self_message = self.set_connection_id(qued_id, connection_id)
		self.ws_write(self_message)
		self.logger.info('!! Offering a webrtc, connection_id %s', connection_id)
		self.publish(opponents_message, room_id, True)

	def reply_call_connection(self, in_message):
		connection_id = in_message[VarNames.CONNECTION_ID]
		conn_users = self.sync_redis.shgetall(connection_id)
		if conn_users[self.id] == WebRtcRedisStates.OFFERED:
			self.async_redis_publisher.hset(connection_id, self.id, WebRtcRedisStates.RESPONDED)
			del conn_users[self.id]
			for user in conn_users:
				if conn_users[user] != WebRtcRedisStates.CLOSED:
					message = self.reply_webrtc(Actions.REPLY_CALL_CONNECTION, connection_id)
					self.publish(message, user)
		else:
			raise ValidationError("Invalid channel status.")

	def reply_file_connection(self, in_message):
		connection_id = in_message[VarNames.CONNECTION_ID]
		sender_ws_id = self.sync_redis.shget(WEBRTC_CONNECTION, connection_id)
		sender_ws_status = self.sync_redis.shget(connection_id, sender_ws_id)
		self_ws_status = self.sync_redis.shget(connection_id, self.id)
		if sender_ws_status == WebRtcRedisStates.READY and self_ws_status == WebRtcRedisStates.OFFERED:
			self.async_redis_publisher.hset(connection_id, self.id, WebRtcRedisStates.RESPONDED)
			self.publish(self.reply_webrtc(Actions.REPLY_FILE_CONNECTION, connection_id), sender_ws_id)
		else:
			raise ValidationError("Invalid channel status.")

	def proxy_webrtc(self, in_message):
		"""
		:type in_message: dict
		"""
		connection_id = in_message[VarNames.CONNECTION_ID]
		channel = in_message.get(VarNames.WEBRTC_OPPONENT_ID)
		self_channel_status = self.sync_redis.shget(connection_id, self.id)
		opponent_channel_status = self.sync_redis.shget(connection_id, channel)
		if not (self_channel_status == WebRtcRedisStates.READY and opponent_channel_status == WebRtcRedisStates.READY):
			raise ValidationError('Error in connection status, your status is {} while opponent is {}'.format(
				self_channel_status, opponent_channel_status
			)) # todo receiver should only accept proxy_webrtc from sender, sender can accept all
		# I mean somebody if there're 3 ppl in 1 channel and first is initing transfer to 2nd and 3rd,
		# 2nd guy can fraud 3rd guy webrtc traffic, which is allowed during the call, but not while transering file
		in_message[VarNames.WEBRTC_OPPONENT_ID] = self.id
		in_message[VarNames.HANDLER_NAME] = HandlerNames.PEER_CONNECTION
		self.logger.debug("Forwarding message to channel %s, self %s, other status %s",
			channel, self_channel_status, opponent_channel_status
		)
		self.publish(in_message, channel)

	def create_new_room(self, message):
		room_name = message[VarNames.ROOM_NAME]
		if not room_name or len(room_name) > 16:
			raise ValidationError('Incorrect room name "{}"'.format(room_name))
		room = Room(name=room_name)
		self.do_db(room.save)
		RoomUsers(room_id=room.id, user_id=self.user_id).save()
		subscribe_message = self.subscribe_room_channel_message(room.id, room_name)
		self.publish(subscribe_message, self.channel, True)

	def invite_user(self, message):
		room_id = message[VarNames.ROOM_ID]
		user_id = message[VarNames.USER_ID]
		if room_id not in self.channels:
			raise ValidationError("Access denied, only allowed for channels {}".format(self.channels))
		room = self.do_db(Room.objects.get, id=room_id)
		if room.is_private:
			raise ValidationError("You can't add users to direct room, create a new room instead")
		try:
			Room.users.through.objects.create(room_id=room_id, user_id=user_id)
		except IntegrityError:
			raise ValidationError("User is already in channel")
		users_in_room = {}
		for user in room.users.all():
			self.set_js_user_structure(users_in_room, user.id, user.username, user.sex)
		self.publish(self.add_user_to_room(room_id, user_id, users_in_room[user_id]), room_id)
		subscribe_message = self.invite_room_channel_message(room_id, user_id, room.name, users_in_room)
		self.publish(subscribe_message, RedisPrefix.generate_user(user_id), True)

	def create_room(self, user_rooms, user_id):
		if self.user_id == user_id:
			room_ids = list([room['room_id'] for room in self.evaluate(user_rooms)])
			query_res = self.execute_query(SELECT_SELF_ROOM, [room_ids, ])
		else:
			rooms_query = RoomUsers.objects.filter(user_id=user_id, room__in=user_rooms)
			query_res = rooms_query.values('room__id', 'room__disabled')
		try:
			room = self.do_db(query_res.get)
			room_id = room['room__id']
			self.update_room(room_id, room['room__disabled'])
		except RoomUsers.DoesNotExist:
			room = Room()
			room.save()
			room_id = room.id
			if self.user_id == user_id:
				RoomUsers(user_id=self.user_id, room_id=room_id).save()
			else:
				RoomUsers.objects.bulk_create([
					RoomUsers(user_id=user_id, room_id=room_id),
					RoomUsers(user_id=self.user_id, room_id=room_id),
				])
		return room_id

	def update_room(self, room_id, disabled):
		if not disabled:
			raise ValidationError('This room already exist')
		else:
			Room.objects.filter(id=room_id).update(disabled=False)

	def create_user_channel(self, message):
		user_id = message[VarNames.USER_ID]
		# get all self private rooms ids
		user_rooms = Room.users.through.objects.filter(user_id=self.user_id, room__name__isnull=True).values('room_id')
		# get private room that contains another user from rooms above
		room_id = self.create_room(user_rooms, user_id)
		subscribe_message = self.subscribe_direct_channel_message(room_id, user_id)
		self.publish(subscribe_message, self.channel, True)
		other_channel = RedisPrefix.generate_user(user_id)
		if self.channel != other_channel:
			self.publish(subscribe_message, other_channel, True)

	def delete_channel(self, message):
		room_id = message[VarNames.ROOM_ID]
		if room_id not in self.channels or room_id == ALL_ROOM_ID:
			raise ValidationError('You are not allowed to exit this room')
		room = self.do_db(Room.objects.get, id=room_id)
		if room.disabled:
			raise ValidationError('Room is already deleted')
		if room.name is None:  # if private then disable
			room.disabled = True
		else: # if public -> leave the room, delete the link
			RoomUsers.objects.filter(room_id=room.id, user_id=self.user_id).delete()
			online = self.get_online_from_redis(room_id)
			online.remove(self.user_id)
			self.publish(self.room_online(online, Actions.LOGOUT, room_id), room_id)
		room.save()
		message = self.unsubscribe_direct_message(room_id)
		self.publish(message, room_id, True)

	def edit_message(self, data):
		message_id = data[VarNames.MESSAGE_ID]
		message = Message.objects.get(id=message_id)
		if message.sender_id != self.user_id:
			raise ValidationError("You can only edit your messages")
		if message.time + 60000 < get_milliseconds():
			raise ValidationError("You can only edit messages that were send not more than 1 min ago")
		if message.deleted:
			raise ValidationError("Already deleted")
		message.content = data[VarNames.CONTENT]
		selector = Message.objects.filter(id=message_id)
		if message.content is None:
			selector.update(deleted=True)
			action = Actions.DELETE_MESSAGE
		else:
			action = Actions.EDIT_MESSAGE
			selector.update(content=message.content)
		self.publish(self.create_send_message(message, action), message.room_id)

	def send_client_new_channel(self, message):
		room_id = message[VarNames.ROOM_ID]
		self.add_channel(room_id)
		self.add_online_user(room_id)

	def set_opponent_call_channel(self, message):
		connection_id = message[VarNames.CONNECTION_ID]
		if message[VarNames.WEBRTC_OPPONENT_ID] == self.id:
			return True
		self.sync_redis.hset(connection_id, self.id, WebRtcRedisStates.OFFERED)

	def send_client_delete_channel(self, message):
		room_id = message[VarNames.ROOM_ID]
		self.async_redis.unsubscribe((room_id,))
		self.async_redis_publisher.hdel(room_id, self.id)
		self.channels.remove(room_id)

	def process_get_messages(self, data):
		"""
		:type data: dict
		"""
		header_id = data.get(VarNames.GET_MESSAGES_HEADER_ID, None)
		count = int(data.get(VarNames.GET_MESSAGES_COUNT, 10))
		room_id = data[VarNames.CHANNEL]
		self.logger.info('!! Fetching %d messages starting from %s', count, header_id)
		if header_id is None:
			messages = Message.objects.filter(Q(room_id=room_id), Q(deleted=False)).order_by('-pk')[:count]
		else:
			messages = Message.objects.filter(Q(id__lt=header_id), Q(room_id=room_id), Q(deleted=False)).order_by('-pk')[:count]
		response = self.do_db(self.get_messages, messages, room_id)
		self.ws_write(response)

	def get_offline_messages(self):
		res = {}
		offline_messages = Message.objects.filter(
			id__gt=F('room__roomusers__last_read_message_id'),
			deleted=False,
			room__roomusers__user_id=self.user_id
		)
		for message in offline_messages:
			res.setdefault(message.room_id, []).append(self.create_message(message))
		return res

	def get_users_in_current_user_rooms(self):
		"""
		{
			"ROOM_ID:1": {
				"name": "All",
				"users": {
					"USER_ID:admin": {
						"name": "USER_NAME:admin",
						"sex": "SEX:Secret"
					},
					"USER_ID_2": {
						"name": "USER_NAME:Mike",
						"sex": "Male"
					}
				},
				"isPrivate": true
			}
		}
		"""
		user_rooms = Room.objects.filter(users__id=self.user_id, disabled=False).values('id', 'name')
		res = {room['id']: {
				VarNames.ROOM_NAME: room['name'],
				VarNames.ROOM_USERS: {}
			} for room in user_rooms}
		room_ids = (room_id for room_id in res)
		rooms_users = User.objects.filter(rooms__in=room_ids).values('id', 'username', 'sex', 'rooms__id')
		for user in rooms_users:
			self.set_js_user_structure(res[user['rooms__id']][VarNames.ROOM_USERS], user['id'], user['username'], user['sex'])
		return res

	def set_js_user_structure(self, user_dict, user_id, name, sex):
		user_dict[user_id] = {
			VarNames.USER: name,
			VarNames.GENDER: GENDERS[sex]
		}

	def save_ip(self):
		if (self.do_db(UserJoinedInfo.objects.filter(
				Q(ip__ip=self.ip) & Q(user_id=self.user_id)).exists)):
			return
		ip_address = get_or_create_ip(self.ip, self.logger)
		UserJoinedInfo.objects.create(
			ip=ip_address,
			user_id=self.user_id
		)

	def publish_logout(self, channel, log_data):
		# seems like async solves problem with connection lost and wrong data status
		# http://programmers.stackexchange.com/questions/294663/how-to-store-online-status
		online, is_online = self.get_online_from_redis(channel, True)
		log_data[channel] = {'online': online, 'is_online': is_online}
		if not is_online:
			message = self.room_online(online, Actions.LOGOUT, channel)
			self.publish(message, channel)
			return True


class AntiSpam(object):

	def __init__(self):
		self.spammed = 0
		self.info = {}

	def check_spam(self, json_message):
		message_length = len(json_message)
		info_key = int(round(time.time() * 100))
		self.info[info_key] = message_length
		if message_length > MAX_MESSAGE_SIZE:
			self.spammed += 1
			raise ValidationError("Message can't exceed %d symbols" % MAX_MESSAGE_SIZE)
		self.check_timed_spam()

	def check_timed_spam(self):
		# TODO implement me
		pass
		# raise ValidationError("You're chatting too much, calm down a bit!")


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
				raise Exception('Access denied for channel {}. Allowed channels: {}'.format(channel, self.channels ))
			self.pre_process_message[message[VarNames.EVENT]](message)
		except ValidationError as e:
			error_message = self.default(str(e.message), Actions.GROWL_MESSAGE, HandlerNames.GROWL)
			self.ws_write(error_message)

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
			res = self.do_db(self.execute_query, UPDATE_LAST_READ_MESSAGE, [self.user_id, ])
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
			self.ws_write(self.set_ws_id(random))

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
			user_db = self.do_db(User.objects.get, id=self.user_id)
			self.sender_name = user_db.username
			self.sex = user_db.sex_str
			user_rooms = self.get_users_in_current_user_rooms()
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

	def ws_write(self, message):
		"""
		Tries to send message, doesn't throw exception outside
		:type self: MessagesHandler
		"""
		# self.logger.debug('<< THREAD %s >>', os.getppid())
		try:
			if isinstance(message, dict):
				message = json.dumps(message)
			if not isinstance(message, str_type):
				raise ValueError('Wrong message type : %s' % str(message))
			self.logger.debug(">> %.1000s", message)
			self.write_message(message)
		except tornado.websocket.WebSocketClosedError as e:
			self.logger.error("%s. Can't send << %s >> message", e, str(message))

	def get_client_ip(self):
		return self.request.headers.get("X-Real-IP") or self.request.remote_ip
