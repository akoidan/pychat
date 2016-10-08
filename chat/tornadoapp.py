import json
import logging
import sys
import time
from threading import Thread
from urllib.request import urlopen

import tornado.gen
import tornado.httpclient
import tornado.ioloop
import tornado.web
import tornado.websocket
import tornadoredis
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import connection, OperationalError, InterfaceError, IntegrityError
from django.db.models import Q, F
from redis_sessions.session import SessionStore
from tornado.websocket import WebSocketHandler

from chat.utils import extract_photo

try:
	from urllib.parse import urlparse  # py2
except ImportError:
	from urlparse import urlparse  # py3

from chat.settings import MAX_MESSAGE_SIZE, ALL_ROOM_ID, GENDERS, UPDATE_LAST_READ_MESSAGE, SELECT_SELF_ROOM
from chat.models import User, Message, Room, IpAddress, get_milliseconds, UserJoinedInfo, RoomUsers

PY3 = sys.version > '3'

api_url = getattr(settings, "IP_API_URL", None)

sessionStore = SessionStore()

base_logger = logging.getLogger(__name__)

# TODO https://github.com/leporo/tornado-redis#connection-pool-support
#CONNECTION_POOL = tornadoredis.ConnectionPool(
#	max_connections=500,
#	wait_for_available=True)


class Actions(object):
	LOGIN = 'addOnlineUser'
	LOGOUT = 'removeOnlineUser'
	SEND_MESSAGE = 'sendMessage'
	PRINT_MESSAGE = 'printMessage'
	CALL = 'call'
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


class VarNames(object):
	CALL_TYPE = 'type'
	USER = 'user'
	USER_ID = 'userId'
	TIME = 'time'
	CONTENT = 'content'
	IMG = 'image'
	EVENT = 'action'
	MESSAGE_ID = 'id'
	GENDER = 'sex'
	ROOM_NAME = 'name'
	ROOM_ID = 'roomId'
	ROOM_USERS = 'users'
	CHANNEL = 'channel'
	GET_MESSAGES_COUNT = 'count'
	GET_MESSAGES_HEADER_ID = 'headerId'
	CHANNEL_NAME = 'channel'
	IS_ROOM_PRIVATE = 'private'
	#ROOM_NAME = 'roomName'
	# ROOM_ID = 'roomId'


class CallType(object):
	OFFER = 'offer'

class HandlerNames:
	NAME = 'handler'
	CHANNELS = 'channels'
	CHAT = 'chat'
	GROWL = 'growl'
	WEBRTC = 'webrtc'
	FILE = 'file'


class RedisPrefix:
	USER_ID_CHANNEL_PREFIX = 'u'
	__ROOM_ONLINE__ = 'o:{}'

	@classmethod
	def generate_user(cls, key):
		return cls.USER_ID_CHANNEL_PREFIX + str(key)

RedisPrefix.DEFAULT_CHANNEL = ALL_ROOM_ID


class MessagesCreator(object):

	def __init__(self, *args, **kwargs):
		super(MessagesCreator, self).__init__(*args, **kwargs)
		self.sex = None
		self.sender_name = None
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
			HandlerNames.NAME: handler
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

	def offer_call(self, content, message_type):
		"""
		:return: {"action": "call", "content": content, "time": "20:48:57"}
		"""
		message = self.default(content, Actions.CALL, HandlerNames.WEBRTC)
		message[VarNames.CALL_TYPE] = message_type
		message[VarNames.USER] = self.sender_name
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
		res[HandlerNames.NAME] = HandlerNames.CHAT
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
			HandlerNames.NAME: HandlerNames.CHAT
		}

	@property
	def stored_redis_user(self):
		return  self.user_id

	@property
	def channel(self):
		return RedisPrefix.generate_user(self.user_id)

	def subscribe_direct_channel_message(self, room_id, other_user_id):
		return {
			VarNames.EVENT: Actions.CREATE_DIRECT_CHANNEL,
			VarNames.ROOM_ID: room_id,
			VarNames.ROOM_USERS: [self.user_id, other_user_id],
			HandlerNames.NAME: HandlerNames.CHANNELS
		}

	def subscribe_room_channel_message(self, room_id, room_name):
		return {
			VarNames.EVENT: Actions.CREATE_ROOM_CHANNEL,
			VarNames.ROOM_ID: room_id,
			VarNames.ROOM_USERS: [self.user_id],
			HandlerNames.NAME: HandlerNames.CHANNELS,
			VarNames.ROOM_NAME: room_name
		}

	def invite_room_channel_message(self, room_id, user_id, room_name, users):
		return {
			VarNames.EVENT: Actions.INVITE_USER,
			VarNames.ROOM_ID: room_id,
			VarNames.USER_ID: user_id,
			HandlerNames.NAME: HandlerNames.CHANNELS,
			VarNames.ROOM_NAME: room_name,
			VarNames.CONTENT: users
		}

	def add_user_to_room(self, channel, user_id, content):
		return {
			VarNames.EVENT: Actions.ADD_USER,
			VarNames.CHANNEL: channel,
			VarNames.USER_ID: user_id,
			HandlerNames.NAME: HandlerNames.CHAT,
			VarNames.GENDER: content[VarNames.GENDER], # SEX: 'Alien', USER: 'Andrew'
			VarNames.USER: content[VarNames.USER] # SEX: 'Alien', USER: 'Andrew'
		}

	def unsubscribe_direct_message(self, room_id):
		return {
			VarNames.EVENT: Actions.DELETE_ROOM,
			VarNames.ROOM_ID: room_id,
			VarNames.USER_ID: self.user_id,
			HandlerNames.NAME: HandlerNames.CHANNELS,
			VarNames.TIME: get_milliseconds()
		}

	def load_offline_message(self, offline_messages, channel_key):
		res = self.default(offline_messages, Actions.OFFLINE_MESSAGES, HandlerNames.CHAT)
		res[VarNames.CHANNEL] = channel_key
		return res


class MessagesHandler(MessagesCreator):

	def __init__(self, *args, **kwargs):
		self.parsable_prefix = 'p'
		super(MessagesHandler, self).__init__(*args, **kwargs)
		self.id = id(self)
		self.log_id = str(self.id % 10000).rjust(4, '0')
		self.ip = None
		from chat import global_redis
		self.async_redis_publisher = global_redis.async_redis_publisher
		self.sync_redis = global_redis.sync_redis
		self.channels = []
		self.call_receiver_channel = None
		self.logger = None
		self.async_redis = tornadoredis.Client()
		self.pre_process_message = {
			Actions.GET_MESSAGES: self.process_get_messages,
			Actions.SEND_MESSAGE: self.process_send_message,
			Actions.CALL: self.process_call,
			Actions.CREATE_DIRECT_CHANNEL: self.create_user_channel,
			Actions.DELETE_ROOM: self.delete_channel,
			Actions.EDIT_MESSAGE: self.edit_message,
			Actions.CREATE_ROOM_CHANNEL: self.create_new_room,
			Actions.INVITE_USER: self.invite_user,
		}
		self.post_process_message = {
			Actions.CREATE_DIRECT_CHANNEL: self.send_client_new_channel,
			Actions.CREATE_ROOM_CHANNEL: self.send_client_new_channel,
			Actions.DELETE_ROOM: self.send_client_delete_channel,
			Actions.INVITE_USER: self.send_client_new_channel,
			Actions.CALL: self.set_opponent_call_channel
		}

	@tornado.gen.engine
	def listen(self, channels):
		yield tornado.gen.Task(
			self.async_redis.subscribe, channels)
		self.async_redis.listen(self.new_message)

	@tornado.gen.engine
	def add_channel(self, channel):
		self.channels.append(channel)
		yield tornado.gen.Task(
			self.async_redis.subscribe, (channel,))

	def do_db(self, callback, *args, **kwargs):
		try:
			return callback(*args, **kwargs)
		except (OperationalError, InterfaceError) as e:  # Connection has gone away
			self.logger.warning('%s, reconnecting' % e)  # TODO
			connection.close()
			return callback(*args, **kwargs)

	def execute_query(self, query, *args, **kwargs):
		cursor = connection.cursor()
		cursor.execute(query, *args, **kwargs)
		return cursor.fetchall()

	def get_online_from_redis(self, channel, check_user_id=None, check_hash=None):
		"""
		:rtype : dict
		returns (dict, bool) if check_type is present
		"""
		online = self.sync_redis.hgetall(channel)
		self.logger.debug('!! channel %s redis online: %s', channel, online)
		result = set()
		user_is_online = False
		# redis stores REDIS_USER_FORMAT, so parse them
		if online:
			for key_hash, raw_user_id in online.items():  # py2 iteritems
				user_id = int(raw_user_id.decode('utf-8'))
				if user_id == check_user_id and check_hash != int(key_hash.decode('utf-8')):
					user_is_online = True
				result.add(user_id)
		result = list(result)
		return (result, user_is_online) if check_user_id else result

	def add_online_user(self, room_id, offline_messages=None):
		"""
		adds to redis
		online_users = { connection_hash1 = stored_redis_user1, connection_hash_2 = stored_redis_user2 }
		:return:
		"""
		self.async_redis_publisher.hset(room_id, self.id, self.stored_redis_user)
		# since we add user to online first, latest trigger will always show correct online
		online, is_online = self.get_online_from_redis(room_id, self.user_id, self.id)
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
				self.safe_write(self.load_offline_message(offline_messages, room_id))
		else:  # Send user names to self
			online_user_names_mes = self.room_online(
				online,
				Actions.REFRESH_USER,
				room_id
			)
			self.logger.info('!! Second tab, retrieving online for self')
			self.safe_write(online_user_names_mes)

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

	def decode(self, message):
		"""
		Check if message should be proccessed by server before writing to client
		@param message: message to check
		@return: Object structure of message if it should be processed, None if not
		"""
		if message.startswith(self.parsable_prefix):
			return json.loads(message[1:])

	def new_message(self, message):
		data = message.body
		if type(data) is not int:  # subscribe event
			decoded = self.decode(data)
			if decoded:
				data = decoded
			self.safe_write(data)
			if decoded:
				self.post_process_message[decoded[VarNames.EVENT]](decoded)

	def safe_write(self, message):
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
			message_db.img = extract_photo(message[VarNames.IMG])
		self.do_db(message_db.save)  # exit on hacked id with exception
		prepared_message = self.create_send_message(message_db)
		self.publish(prepared_message, channel)

	def process_call(self, in_message):
		"""
		:type in_message: dict
		"""
		call_type = in_message.get(VarNames.CALL_TYPE)
		set_opponent_channel = False
		out_message = self.offer_call(in_message.get(VarNames.CONTENT), call_type)
		if call_type == CallType.OFFER:
			room_id = in_message[VarNames.CHANNEL]
			user = User.rooms.through.objects.get(~Q(user_id=self.user_id), Q(room_id=room_id), Q(room__name__isnull=True))
			self.call_receiver_channel = RedisPrefix.generate_user(user.user_id)
			set_opponent_channel = True
			out_message[VarNames.CHANNEL] = room_id
		# TODO
		self.logger.info('!! Offering a call to user with id %s',  self.call_receiver_channel)
		self.publish(out_message, self.call_receiver_channel, set_opponent_channel)

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

	def create_self_room(self, user_rooms):
		rooms_ids = list([room['room_id'] for room in user_rooms])
		query_res = self.execute_query(SELECT_SELF_ROOM, [rooms_ids,])
		if len(query_res) > 0:
			room = query_res[0]
			room_id = room[0]
			self.update_room(room_id, room[1])
		else:
			room = Room()
			room.save()
			room_id = room.id
			RoomUsers(user_id=self.user_id, room_id=room_id).save()
		return room_id

	def create_other_room(self, user_rooms, user_id):
		query_res = Room.users.through.objects.filter(user_id=user_id, room__in=user_rooms).values('room__id', 'room__disabled')
		if len(query_res) > 0:
			room = query_res[0]
			room_id = room['room__id']
			self.update_room(room_id, room['room__disabled'])
		else:
			room = Room()
			room.save()
			room_id = room.id
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
		if self.user_id == user_id:
			room_id = self.create_self_room(user_rooms)
		else:
			room_id = self.create_other_room(user_rooms, user_id)
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
		self.call_receiver_channel = RedisPrefix.generate_user(message[VarNames.USER_ID])

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
		self.safe_write(response)

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
		ip_address = self.get_or_create_ip()
		UserJoinedInfo.objects.create(
			ip=ip_address,
			user_id=self.user_id
		)

	def get_or_create_ip(self):
		try:
			ip_address = IpAddress.objects.get(ip=self.ip)
		except IpAddress.DoesNotExist:
			try:
				if not api_url:
					raise Exception('api url is absent')
				self.logger.debug("Creating ip record %s", self.ip)
				f = urlopen(api_url % self.ip)
				raw_response = f.read().decode("utf-8")
				response = json.loads(raw_response)
				if response['status'] != "success":
					raise Exception("Creating iprecord failed, server responded: %s" % raw_response)
				ip_address = IpAddress.objects.create(
					ip=self.ip,
					isp=response['isp'],
					country=response['country'],
					region=response['regionName'],
					city=response['city'],
					country_code=response['countryCode']
				)
			except Exception as e:
				self.logger.error("Error while creating ip with country info, because %s", e)
				ip_address = IpAddress.objects.create(ip=self.ip)
		return ip_address


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
		self.connected = False
		self.anti_spam = AntiSpam()

	def data_received(self, chunk):
		pass

	def on_message(self, json_message):
		try:
			if not self.connected:
				raise ValidationError('Skipping message %s, as websocket is not initialized yet' % json_message)
			if not json_message:
				raise ValidationError('Skipping null message')
			# self.anti_spam.check_spam(json_message)
			self.logger.debug('<< %s', json_message)
			message = json.loads(json_message)
			if message[VarNames.EVENT] not in self.pre_process_message:
				raise ValidationError("event {} is unknown".format(message[VarNames.EVENT]))
			channel = message.get(VarNames.CHANNEL)
			if channel and channel not in self.channels:
				raise ValidationError('Access denied for channel {}. Allowed channels: {}'.format(channel, self.channels ))
			self.pre_process_message[message[VarNames.EVENT]](message)
		except ValidationError as e:
			error_message = self.default(str(e.message), Actions.GROWL_MESSAGE, HandlerNames.GROWL)
			self.safe_write(error_message)

	def on_close(self):
		if self.async_redis.subscribed:
			self.logger.info("Close event, unsubscribing from %s", self.channels)
			self.async_redis.unsubscribe(self.channels)
		else:
			self.logger.info("Close event, not subscribed, channels: %s", self.channels)
		log_data = {}
		gone_offline = False
		for channel in self.channels:
			if not isinstance(channel, int):
				continue
			self.sync_redis.hdel(channel, self.id)
			if self.connected:
				# seems like async solves problem with connection lost and wrong data status
				# http://programmers.stackexchange.com/questions/294663/how-to-store-online-status
				online, is_online = self.get_online_from_redis(channel, self.user_id, self.id)
				log_data[channel] = {'online': online, 'is_online': is_online}
				if not is_online:
					message = self.room_online(online, Actions.LOGOUT, channel)
					self.publish(message, channel)
					gone_offline = True
		if gone_offline:
			res = self.do_db(self.execute_query, UPDATE_LAST_READ_MESSAGE, [self.user_id, ])
			self.logger.info("Updated %s last read message", res)

		self.logger.info("Close connection result: %s", json.dumps(log_data))
		self.async_redis.disconnect()

	def open(self):
		session_key = self.get_cookie(settings.SESSION_COOKIE_NAME)
		if sessionStore.exists(session_key):
			self.ip = self.get_client_ip()
			session = SessionStore(session_key)
			self.user_id = int(session["_auth_user_id"])
			log_params = {
				'user_id': str(self.user_id).zfill(3),
				'id': self.log_id,
				'ip': self.ip
			}
			self.logger = logging.LoggerAdapter(base_logger, log_params)
			self.logger.debug("!! Incoming connection, session %s, thread hash %s", session_key, self.id)
			self.async_redis.connect()
			user_db = self.do_db(User.objects.get, id=self.user_id)
			self.sender_name = user_db.username
			self.sex = user_db.sex_str
			user_rooms = self.get_users_in_current_user_rooms()
			self.safe_write(self.default(user_rooms, Actions.ROOMS, HandlerNames.CHANNELS))
			# get all missed messages
			self.channels.clear()
			self.channels.append(self.channel)
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

	def safe_write(self, message):
		"""
		Tries to send message, doesn't throw exception outside
		:type self: MessagesHandler
		"""
		# self.logger.debug('<< THREAD %s >>', os.getppid())
		try:
			if isinstance(message, dict):
				message = json.dumps(message)
			if not (isinstance(message, str) or (not PY3 and isinstance(message, unicode))):
				raise ValueError('Wrong message type : %s' % str(message))
			self.logger.debug(">> %s", message)
			self.write_message(message)
		except tornado.websocket.WebSocketClosedError as e:
			self.logger.error("%s. Can't send << %s >> message", e, str(message))

	def get_client_ip(self):
		return self.request.headers.get("X-Real-IP") or self.request.remote_ip
