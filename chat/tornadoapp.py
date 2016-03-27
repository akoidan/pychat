import json
import logging
import sys
from threading import Thread
from urllib.request import urlopen

import time
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
import os

from chat.log_filters import id_generator

try:
	from urllib.parse import urlparse  # py2
except ImportError:
	from urlparse import urlparse  # py3

from chat.settings import MAX_MESSAGE_SIZE, ALL_REDIS_ROOM
from chat.models import User, Message, Room, IpAddress, get_milliseconds, UserJoinedInfo
from chat.utils import check_user

PY3 = sys.version > '3'

user_cookie_name = settings.USER_COOKIE_NAME
api_url = getattr(settings, "IP_API_URL", None)

SESSION_USER_VAR_KEY = 'user_name'

MESSAGE_ID_VAR_NAME = 'id'
RECEIVER_USERNAME_VAR_NAME = 'receiverName'
RECEIVER_USERID_VAR_NAME = 'receiverId'
CALL_TYPE_VAR_NAME = 'type'
COUNT_VAR_NAME = 'count'
HEADER_ID_VAR_NAME = 'headerId'
USER_VAR_NAME = 'user'
USER_ID_VAR_NAME = 'userId'
TIME_VAR_NAME = 'time'
OLD_NAME_VAR_NAME = 'oldName'
CONTENT_VAR_NAME = 'content'
EVENT_VAR_NAME = 'action'
GENDER_VAR_NAME = 'sex'

REFRESH_USER_EVENT = 'onlineUsers'
SYSTEM_MESSAGE_EVENT = 'system'
GROWL_MESSAGE_EVENT = 'growl'
GET_MESSAGES_EVENT = 'messages'
ROOMS_EVENT = 'rooms'  # thread ex "main" , channel ex. 'r:main', "i:3"
LOGIN_EVENT = 'joined'
LOGOUT_EVENT = 'left'
SEND_MESSAGE_EVENT = 'send'
WEBRTC_EVENT = 'webrtc'
CALL_EVENT = 'call'

REDIS_USERID_CHANNEL_PREFIX = 'i:%s'
REDIS_ROOM_CHANNEL_PREFIX = 'r:%d'
REDIS_ONLINE_USERS = "online_users"

(default_room, c)  = Room.objects.get_or_create(name=ALL_REDIS_ROOM)

ANONYMOUS_REDIS_CHANNEL = REDIS_ROOM_CHANNEL_PREFIX % default_room.id
ANONYMOUS_ROOM_NAMES = {default_room.id: default_room.name}

sessionStore = SessionStore()

logger = logging.getLogger(__name__)

# TODO https://github.com/leporo/tornado-redis#connection-pool-support
CONNECTION_POOL = tornadoredis.ConnectionPool(
	max_connections=500,
	wait_for_available=True)


class MessagesCreator(object):

	def __init__(self, *args, **kwargs):
		super(MessagesCreator, self).__init__(*args, **kwargs)
		self.sex = None
		self.sender_name = None
		self.user_id = 0  # anonymous by default

	def default(self, content, event=SYSTEM_MESSAGE_EVENT):
		"""
		:return: {"action": event, "content": content, "time": "20:48:57"}
		"""
		return {
			EVENT_VAR_NAME: event,
			CONTENT_VAR_NAME: content,
			USER_ID_VAR_NAME: self.user_id,
			USER_VAR_NAME: self.sender_name,
			TIME_VAR_NAME: get_milliseconds()
		}

	def offer_call(self, content, type):
		"""
		:return: {"action": "call", "content": content, "time": "20:48:57"}
		"""
		message = self.default(content, CALL_EVENT)
		message[CALL_TYPE_VAR_NAME] = type
		return message

	@classmethod
	def create_send_message(cls, message):
		"""
		:type message: Message
		"""
		result = cls.get_message(message)
		result[EVENT_VAR_NAME] = SEND_MESSAGE_EVENT
		return result

	@classmethod
	def get_message(cls, message):
		"""
		:param message:
		:return: "action": "joined", "content": {"v5bQwtWp": "alien", "tRD6emzs": "Alien"},
		"sex": "Alien", "user": "tRD6emzs", "time": "20:48:57"}
		"""
		result = {
			USER_VAR_NAME: message.sender.username,
			USER_ID_VAR_NAME: message.sender.id,
			CONTENT_VAR_NAME: message.content,
			TIME_VAR_NAME: message.time,
			MESSAGE_ID_VAR_NAME: message.id,
		}
		if message.receiver is not None:
			result[RECEIVER_USERID_VAR_NAME] = message.receiver.id
			result[RECEIVER_USERNAME_VAR_NAME] = message.receiver.username
		return result

	@classmethod
	def get_messages(cls, messages):
		"""
		:type messages: list[Messages]
		:type messages: QuerySet[Messages]
		"""
		return {
			CONTENT_VAR_NAME: [cls.create_send_message(message) for message in messages],
			EVENT_VAR_NAME: GET_MESSAGES_EVENT
		}

	@property
	def stored_redis_user(self):
		return '%s:%s:%d' % (self.sender_name, self.sex, self.user_id)

	@property
	def channel(self):
		return REDIS_USERID_CHANNEL_PREFIX % self.user_id

	@staticmethod
	def online_js_structure(name, sex, user_id):
		return {
			name: {
				GENDER_VAR_NAME: sex,
				USER_ID_VAR_NAME: user_id
			}
		}

	@property
	def online_self_js_structure(self):
		return self.online_js_structure(self.sender_name, self.sex, self.user_id)


class MessagesHandler(MessagesCreator):

	def __init__(self, *args, **kwargs):
		super(MessagesHandler, self).__init__(*args, **kwargs)
		self.log_id = str(id(self) % 10000).rjust(4, '0')
		self.ip = None
		log_params = {
			'username': '00000000',
			'id': self.log_id,
			'ip': 'initializing'
		}
		self.logger = logging.LoggerAdapter(logger, log_params)
		self.async_redis = tornadoredis.Client()
		self.process_message = {
			GET_MESSAGES_EVENT: self.process_get_messages,
			SEND_MESSAGE_EVENT: self.process_send_message,
			CALL_EVENT: self.process_call
		}

	def do_db(self, callback, *arg, **args):
		try:
			return callback(*arg, **args)
		except (OperationalError, InterfaceError) as e:  # Connection has gone away
			self.logger.warning('%s, reconnecting' % e)  # TODO
			connection.close()
			return callback(*arg, **args)

	def get_online_from_redis(self, check_name=None, check_id=None):
		"""
		:rtype : dict
		returns (dict, bool) if check_type is present
		"""
		online = self.sync_redis.hgetall(REDIS_ONLINE_USERS)
		self.logger.debug('!! redis online: %s', online)
		result = {}
		user_is_online = False
		# redis stores REDIS_USER_FORMAT, so parse them
		if online:
			for key, raw_user_sex in online.items():  # py2 iteritems
				(name, sex, user_id) = raw_user_sex.decode('utf-8').split(':')
				if name == check_name and check_id != int(key.decode('utf-8')):
					user_is_online = True
				result.update(self.online_js_structure(name, sex, user_id))
		return (result, user_is_online) if check_id else result

	def add_online_user(self):
		"""
		adds to redis
		online_users = { connection_hash1 = stored_redis_user1, connection_hash_2 = stored_redis_user2 }
		:return:
		"""
		online = self.get_online_from_redis()
		self.async_redis_publisher.hset(REDIS_ONLINE_USERS, id(self), self.stored_redis_user)
		if self.sender_name not in online:  # if a new tab has been opened
			online.update(self.online_self_js_structure)
			online_user_names_mes = self.default(online, LOGIN_EVENT)
			self.logger.info('!! First tab, sending refresh online for all')
			self.publish(online_user_names_mes)
		else:  # Send user names to self
			online_user_names_mes = self.default(online, REFRESH_USER_EVENT)
			self.logger.info('!! Second tab, retrieving online for self')
			self.safe_write(online_user_names_mes)

	def set_username(self, session_key):
		"""
		Case registered: Fetch userName and its channels from database. returns them
		:return: channels user should subscribe
		"""
		session = SessionStore(session_key)
		self.user_id = int(session["_auth_user_id"])
		user_db = self.do_db(User.objects.get, id=self.user_id)  # everything but 0 is a registered user
		self.sender_name = user_db.username
		self.sex = user_db.sex_str
		rooms = user_db.rooms.all()  # do_db is used already
		room_names = {}
		channels = [self.channel, ]
		for room in rooms:
			room_names[room.id] = room.name
			channels.append(REDIS_ROOM_CHANNEL_PREFIX % room.id)
		rooms_message = self.default(room_names, ROOMS_EVENT)
		self.logger.info("!! User %s subscribes for %s", self.sender_name, room_names)
		self.safe_write(rooms_message)
		return channels

	def publish(self, message, channel=ANONYMOUS_REDIS_CHANNEL):
		jsoned_mess = json.dumps(message)
		self.logger.debug('<%s> %s', channel, jsoned_mess)
		self.async_redis_publisher.publish(channel, jsoned_mess)

	def new_message(self, message):
		if type(message.body) is not int:  # subscribe event
			self.safe_write(message.body)

	def safe_write(self, message):
		raise NotImplementedError('WebSocketHandler implements')

	def process_send_message(self, message):
		"""
		:type message: dict
		"""
		content = message[CONTENT_VAR_NAME]
		receiver_id = message.get(RECEIVER_USERID_VAR_NAME)  # if receiver_id is None then its a private message
		self.logger.info('!! Sending message %s to user with id %s', content, receiver_id)
		receiver_channel = REDIS_USERID_CHANNEL_PREFIX % receiver_id
		message_db = Message(sender_id=self.user_id, content=content, receiver_id=receiver_id)
		self.do_db(message_db.save)  # exit on hacked id with exception
		prepared_message = self.create_send_message(message_db)
		if receiver_id is None:
			self.logger.debug('!! Detected as public')
			self.publish(prepared_message)
		else:
			self.publish(prepared_message, self.channel)
			self.logger.debug('!! Detected as private, channel %s', receiver_channel)
			if receiver_channel != self.channel:
				self.publish(prepared_message, receiver_channel)

	def process_call(self, message):
			"""
			:type message: dict
			"""
			receiver_id = message.get(RECEIVER_USERID_VAR_NAME)  # if receiver_id is None then its a private message
			self.logger.info('!! Offering a call to user with id %s',  receiver_id)
			message = self.offer_call(message.get(CONTENT_VAR_NAME), message.get(CALL_TYPE_VAR_NAME))
			self.publish(message, REDIS_USERID_CHANNEL_PREFIX % receiver_id)

	def process_get_messages(self, data):
		"""
		:type data: dict
		"""
		header_id = data.get(HEADER_ID_VAR_NAME, None)
		count = int(data.get(COUNT_VAR_NAME, 10))
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
		from chat import global_redis
		self.async_redis_publisher = global_redis.async_redis_publisher
		self.sync_redis = global_redis.sync_redis

	@tornado.gen.engine
	def listen(self, channels):
		"""
		self.channel should been set before calling
		"""
		yield tornado.gen.Task(
			self.async_redis.subscribe, channels)
		self.async_redis.listen(self.new_message)

	def data_received(self, chunk):
		pass

	def on_message(self, json_message):
		try:
			if not self.connected:
				raise ValidationError('Skipping message %s, as websocket is not initialized yet' % json_message)
			if not json_message:
				raise ValidationError('Skipping null message')
			self.anti_spam.check_spam(json_message)
			self.logger.debug('<< %s', json_message)
			message = json.loads(json_message)
			self.process_message[message[EVENT_VAR_NAME]](message)
		except ValidationError as e:
			self.logger.warning("Message won't be send. Reason: %s", e.message)
			self.safe_write(self.default(str(e.message), event=GROWL_MESSAGE_EVENT))

	def on_close(self):
		try:
			self_id = id(self)
			self.async_redis_publisher.hdel(REDIS_ONLINE_USERS, self_id)
			if self.connected:
				# seems like async solves problem with connection lost and wrong data status
				# http://programmers.stackexchange.com/questions/294663/how-to-store-online-status
				online, is_online = self.get_online_from_redis(self.sender_name, self_id)
				self.logger.info('!! Closing connection, redis current online %s', online)
				if not is_online:
					message = self.default(online, LOGOUT_EVENT)
					self.logger.debug('!! User closed the last tab, refreshing online for all')
					self.publish(message)
				else:
					self.logger.debug('!! User is still online in other tabs')
			else:
				self.logger.warning('Dropping connection for not connected user')
		finally:
			if self.async_redis.subscribed:
				#  TODO unsubscribe of all subscribed                  !IMPORTANT
				self.async_redis.unsubscribe([
					ANONYMOUS_REDIS_CHANNEL,
					self.channel
				])
			self.async_redis.disconnect()

	def open(self):
		session_key = self.get_cookie(settings.SESSION_COOKIE_NAME)
		if sessionStore.exists(session_key):
			self.logger.debug("!! Incoming connection, session %s, thread hash %s", session_key, id(self))
			self.async_redis.connect()
			channels = self.set_username(session_key)
			self.ip = self.get_client_ip()
			log_params = {
				'username': self.sender_name.rjust(8),
				'id': self.log_id,
				'ip': self.ip
			}
			self.logger = logging.LoggerAdapter(logger, log_params)
			self.listen(channels)
			self.add_online_user()
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
