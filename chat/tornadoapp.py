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
from django.db import connection, OperationalError, InterfaceError
from django.db.models import Q
from redis_sessions.session import SessionStore
from tornado.websocket import WebSocketHandler

from chat.utils import extract_photo

try:
	from urllib.parse import urlparse  # py2
except ImportError:
	from urlparse import urlparse  # py3

from chat.settings import MAX_MESSAGE_SIZE, ALL_ROOM_ID, USER_ROOMS_QUERY, GENDERS, GET_DIRECT_ROOM_ID
from chat.models import User, Message, Room, IpAddress, get_milliseconds, UserJoinedInfo

PY3 = sys.version > '3'

api_url = getattr(settings, "IP_API_URL", None)

sessionStore = SessionStore()

logger = logging.getLogger(__name__)

# TODO https://github.com/leporo/tornado-redis#connection-pool-support
#CONNECTION_POOL = tornadoredis.ConnectionPool(
#	max_connections=500,
#	wait_for_available=True)


class Actions:
	LOGIN = 'addOnlineUser'
	LOGOUT = 'removeOnlineUser'
	SEND_MESSAGE = 'sendMessage'
	PRINT_MESSAGE = 'printMessage'
	CALL = 'call'
	ROOMS = 'setRooms'
	REFRESH_USER = 'setOnlineUsers'
	SYSTEM_MESSAGE = 'system'
	GROWL_MESSAGE = 'growl'
	GET_MESSAGES = 'messages'
	CREATE_DIRECT_CHANNEL = 'direct'


class VarNames:
	RECEIVER_ID = 'receiverId'
	RECEIVER_NAME = 'receiverName'
	CALL_TYPE = 'type'
	USER = 'user'
	USER_ID =  'userId'
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
	CHANNEL_NAME = 'channel'
	IS_ROOM_PRIVATE = 'private'
	#ROOM_NAME = 'roomName'
	# ROOM_ID = 'roomId'


class HandlerNames:
	NAME = 'handler'
	CHANNELS = 'channels'
	CHAT = 'chat'
	GROWL = 'growl'
	WEBRTC = 'webrtc'


class RedisPrefix:
	USER_ID_CHANNEL_PREFIX = 'u'
	ROOM_CHANNEL_PREFIX = 'r'
	__ROOM_ONLINE__ = 'o:{}'

	@classmethod
	def generate_user(cls, key):
		return cls.USER_ID_CHANNEL_PREFIX + str(key)

	@classmethod
	def generate_room(cls, key):
		return cls.ROOM_CHANNEL_PREFIX + str(key)

RedisPrefix.DEFAULT_CHANNEL = RedisPrefix.generate_room(ALL_ROOM_ID)


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
		return room_less

	def offer_call(self, content, message_type):
		"""
		:return: {"action": "call", "content": content, "time": "20:48:57"}
		"""
		message = self.default(content, Actions.CALL, HandlerNames.WEBRTC)
		message[VarNames.CALL_TYPE] = message_type
		return message

	@classmethod
	def create_send_message(cls, message):
		"""
		:param message:
		:return: "action": "joined", "content": {"v5bQwtWp": "alien", "tRD6emzs": "Alien"},
		"sex": "Alien", "user": "tRD6emzs", "time": "20:48:57"}
		"""
		if message.receiver_id:
			channel = RedisPrefix.generate_user(message.receiver_id)
		elif message.room_id:
			channel = RedisPrefix.generate_room(message.room_id)
		else:
			raise ValidationError('Channel is none')
		result = {
			VarNames.USER_ID: message.sender_id,
			VarNames.CONTENT: message.content,
			VarNames.TIME: message.time,
			VarNames.MESSAGE_ID: message.id,
			VarNames.EVENT: Actions.PRINT_MESSAGE,
			VarNames.CHANNEL: channel,
			HandlerNames.NAME: HandlerNames.CHAT
		}
		if message.img.name:
			result[VarNames.IMG] = message.img.url
		if message.receiver_id:
			result[VarNames.RECEIVER_ID] = message.receiver.id
			result[VarNames.RECEIVER_NAME] = message.receiver.username
		return result

	@classmethod
	def get_messages(cls, messages):
		"""
		:type messages: list[Messages]
		:type messages: QuerySet[Messages]
		"""
		return {
			VarNames.CONTENT: [cls.create_send_message(message) for message in messages],
			VarNames.EVENT: Actions.GET_MESSAGES
		}

	@property
	def stored_redis_user(self):
		return  self.user_id

	@property
	def channel(self):
		return RedisPrefix.generate_user(self.user_id)

	@staticmethod
	def online_js_structure(name, sex, user_id):
		return {
			name: {
				VarNames.GENDER: sex,
				VarNames.USER_ID: user_id
			}
		}

	def subscribe_direct_message(self, room_id, other_user_id):
		return {
			VarNames.EVENT: Actions.CREATE_DIRECT_CHANNEL,
			VarNames.ROOM_ID: room_id,
			VarNames.ROOM_USERS: [self.user_id, other_user_id],
			HandlerNames.NAME: HandlerNames.CHANNELS
		}


class MessagesHandler(MessagesCreator):

	def __init__(self, *args, **kwargs):
		self.parsable_prefix = 'p'
		super(MessagesHandler, self).__init__(*args, **kwargs)
		self.log_id = str(id(self) % 10000).rjust(4, '0')
		self.ip = None
		self.room_names = {}
		log_params = {
			'user_id': '000',
			'id': self.log_id,
			'ip': 'initializing'
		}
		from chat import global_redis
		self.async_redis_publisher = global_redis.async_redis_publisher
		self.sync_redis = global_redis.sync_redis
		self.channels = []
		self.logger = logging.LoggerAdapter(logger, log_params)
		self.async_redis = tornadoredis.Client()
		self.pre_process_message = {
			Actions.GET_MESSAGES: self.process_get_messages,
			Actions.SEND_MESSAGE: self.process_send_message,
			Actions.CALL: self.process_call,
			Actions.CREATE_DIRECT_CHANNEL: self.create_user_channel,
		}
		self.post_process_message = {
			Actions.CREATE_DIRECT_CHANNEL: self.send_client_new_direct_channel
		}

	@tornado.gen.engine
	def listen(self, channels):
		"""
		self.channel should been set before calling
		"""
		yield tornado.gen.Task(
			self.async_redis.subscribe, channels)

	def do_db(self, callback, *arg, **args):
		try:
			return callback(*arg, **args)
		except (OperationalError, InterfaceError) as e:  # Connection has gone away
			self.logger.warning('%s, reconnecting' % e)  # TODO
			connection.close()
			return callback(*arg, **args)

	def get_online_from_redis(self, room_id, check_user_id=None, check_hash=None):
		"""
		:rtype : dict
		returns (dict, bool) if check_type is present
		"""
		online = self.sync_redis.hgetall(RedisPrefix.generate_room(room_id))
		self.logger.debug('!! redis online: %s', online)
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

	def add_online_user(self, room_id):
		"""
		adds to redis
		online_users = { connection_hash1 = stored_redis_user1, connection_hash_2 = stored_redis_user2 }
		:return:
		"""
		online = self.get_online_from_redis(room_id)
		channel_key = RedisPrefix.generate_room(room_id)
		self.async_redis_publisher.hset(channel_key, id(self), self.stored_redis_user)
		if self.user_id not in online:  # if a new tab has been opened
			online.append(self.user_id)
			online_user_names_mes = self.room_online(
				online,
				Actions.LOGIN,
				channel_key
			)
			self.logger.info('!! First tab, sending refresh online for all')
			self.publish(online_user_names_mes, channel_key)
		else:  # Send user names to self
			online_user_names_mes = self.room_online(
				online,
				Actions.REFRESH_USER,
				channel_key
			)
			self.logger.info('!! Second tab, retrieving online for self')
			self.safe_write(online_user_names_mes)

	def get_channels(self):
		"""
		Case registered: Fetch userName and its channels from database. returns them
		:return: channels user should subscribe
		"""
		self.channels.clear()
		user_db = self.do_db(User.objects.get, id=self.user_id)  # everything but 0 is a registered user
		self.sender_name = user_db.username
		self.sex = user_db.sex_str
		rooms = user_db.rooms.all()  # do_db is used already
		self.channels.append(self.channel)
		for room in rooms:
			self.room_names[room.id] = room.name
			self.channels.append(RedisPrefix.generate_room(room.id))
		self.logger.info("!! User %s subscribes for %s", self.sender_name, self.room_names)

	def publish(self, message, channel=None, parsable=False):
		if channel is None:
			raise ValidationError('lolol')
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
				self.post_process_message[decoded[VarNames.EVENT]](decoded)
			self.safe_write(data)

	def safe_write(self, message):
		raise NotImplementedError('WebSocketHandler implements')

	def process_send_message(self, message):
		"""
		:type message: dict
		"""
		content = message[VarNames.CONTENT]
		receiver_id = message.get(VarNames.RECEIVER_ID)  # if receiver_id is None then its a private message
		self.logger.info('!! Sending message %s to user with id %s', content, receiver_id)
		channel = message[VarNames.CHANNEL]
		message_db = Message(
			sender_id=self.user_id,
			content=content
		)
		channel_id = int(channel[1:])
		if channel.startswith(RedisPrefix.USER_ID_CHANNEL_PREFIX):
			message_db.receiver_id = channel_id
		elif channel.startswith(RedisPrefix.ROOM_CHANNEL_PREFIX) and channel in self.channels:
			message_db.room_id = channel_id
		else:
			raise ValidationError('Access denied for channel {}'.format(channel))
		if VarNames.IMG in message:
			message_db.img = extract_photo(message[VarNames.IMG])
		self.do_db(message_db.save)  # exit on hacked id with exception
		prepared_message = self.create_send_message(message_db)
		if message_db.receiver_id is None:
			self.logger.debug('!! Detected as public')
			self.publish(prepared_message, channel)
		else:
			self.publish(prepared_message, self.channel)
			self.logger.debug('!! Detected as private, channel %s', channel)
			if channel != self.channel:
				self.publish(prepared_message, channel)

	def process_call(self, message):
		"""
		:type message: dict
		"""
		receiver_id = message.get(VarNames.RECEIVER_ID)  # if receiver_id is None then its a private message
		self.logger.info('!! Offering a call to user with id %s',  receiver_id)
		message = self.offer_call(message.get(VarNames.CONTENT), message.get(VarNames.CALL_TYPE))
		self.publish(message, RedisPrefix.generate_user(receiver_id))

	def create_user_channel(self, message):
		user_id = message[VarNames.USER_ID]
		cursor = connection.cursor()
		cursor.execute(GET_DIRECT_ROOM_ID, [self.user_id, user_id])
		query_res = cursor.fetchall()
		if len(query_res) > 0:
			raise ValidationError('This room already exist')
		room = Room(is_private=True)
		room.save()
		room.users.add(self.user_id, user_id)
		room.save()
		subscribe_message = self.subscribe_direct_message(room.id, user_id)
		self.publish(subscribe_message, self.channel, True)
		self.publish(subscribe_message, RedisPrefix.generate_user(user_id), True)

	def create_channel(self, message):
		"""
		:type message: dict
		"""
		receiver_id = message.get(VarNames.RECEIVER_ID)  # if receiver_id is None then its a private message
		self.logger.info('!! Offering a call to user with id %s', receiver_id)
		message = self.offer_call(message.get(VarNames.CONTENT), message.get(VarNames.CALL_TYPE))
		self.publish(message, RedisPrefix.generate_user(receiver_id))

	def send_client_new_direct_channel(self, message):
		channel = RedisPrefix.generate_room(message[VarNames.ROOM_ID])
		self.listen(channel)

	def process_get_messages(self, data):
		"""
		:type data: dict
		"""
		header_id = data.get('headerId', None)
		count = int(data.get('count', 10))
		self.logger.info('!! Fetching %d messages starting from %s', count, header_id)
		if header_id is None:
			messages = Message.objects.filter(
				# Only public or private or private
				Q(receiver=None) | Q(sender=self.user_id) | Q(receiver=self.user_id)
			).order_by('-pk')[:count]
		else:
			messages = Message.objects.filter(
				Q(id__lt=header_id),
				Q(receiver=None) | Q(sender=self.user_id) | Q(receiver=self.user_id)
			).order_by('-pk')[:count]
		response = self.do_db(self.get_messages, messages)
		self.safe_write(response)

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
		cursor = connection.cursor()
		cursor.execute(USER_ROOMS_QUERY, [self.user_id])
		query_res = cursor.fetchall()
		res = {}
		for user in query_res:
			user_id = user[0]
			user_name = user[1]
			user_sex = user[2]
			room_id = user[3]
			room_name = user[4]
			if room_id not in res:
				res[room_id] = {
					VarNames.ROOM_NAME: room_name,
					VarNames.ROOM_USERS: {}
				}
			res[room_id][VarNames.ROOM_USERS][user_id] = {
				VarNames.USER : user_name,
				VarNames.GENDER: GENDERS[user_sex]
			}
		return res

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
			self.pre_process_message[message[VarNames.EVENT]](message)
		except ValidationError as e:
			self.logger.warning("Message won't be send, because : %s", e.message)
			error_message = self.default(str(e.message), Actions.GROWL_MESSAGE, HandlerNames.GROWL)
			self.safe_write(error_message)

	def on_close(self):
		self_id = id(self)
		if self.async_redis.subscribed:
			self.async_redis.unsubscribe(self.channels)
		for channel in self.channels:
			if channel.startswith(RedisPrefix.ROOM_CHANNEL_PREFIX):
				self.async_redis_publisher.hdel(channel, self_id)
				if self.connected:
					# seems like async solves problem with connection lost and wrong data status
					# http://programmers.stackexchange.com/questions/294663/how-to-store-online-status
					online, is_online = self.get_online_from_redis(channel, self.sender_name, self_id)
					self.logger.info('!! Closing connection, redis current online %s', online)
					if not is_online:
						message = self.default(online, Actions.LOGOUT, HandlerNames.CHAT)
						self.logger.debug('!! User closed the last tab, refreshing online for all')
						self.publish(message, channel)
					else:
						self.logger.debug('!! User is still online in other tabs')
				else:
					self.logger.warning('Dropping connection for not connected user')
		self.async_redis.disconnect()

	def open(self):
		session_key = self.get_cookie(settings.SESSION_COOKIE_NAME)
		if sessionStore.exists(session_key):
			self.logger.debug("!! Incoming connection, session %s, thread hash %s", session_key, id(self))
			self.async_redis.connect()
			session = SessionStore(session_key)
			self.user_id = int(session["_auth_user_id"])
			user_rooms = self.get_users_in_current_user_rooms()
			self.safe_write(self.default(user_rooms, Actions.ROOMS, HandlerNames.CHANNELS))
			self.get_channels()
			self.ip = self.get_client_ip()
			log_params = {
				'user_id': str(self.user_id).zfill(3),
				'id': self.log_id,
				'ip': self.ip
			}
			self.logger = logging.LoggerAdapter(logger, log_params)
			self.async_redis.listen(self.new_message)
			self.listen(self.channels)
			for room_id in self.room_names:
				self.add_online_user(room_id)
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
