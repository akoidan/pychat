import json
import logging
import sys
from threading import Thread
from  urllib.request import urlopen

import redis
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

from chat.log_filters import id_generator

try:
	from urllib.parse import urlparse  # py2
except ImportError:
	from urlparse import urlparse  # py3

from chat.settings import MAX_MESSAGE_SIZE, ANONYMOUS_REDIS_ROOM
from chat.models import User, Message, Room, IpAddress, get_milliseconds, UserJoinedInfo
from chat.utils import check_user

PY3 = sys.version > '3'

user_cookie_name = settings.USER_COOKIE_NAME
api_url = getattr(settings, "IP_API_URL", None)

ANONYMOUS_GENDER = 'Alien'
SESSION_USER_VAR_KEY = 'user_name'

MESSAGE_ID_VAR_NAME = 'id'
RECEIVER_USERNAME_VAR_NAME = 'receiverName'
RECEIVER_USERID_VAR_NAME = 'receiverId'
COUNT_VAR_NAME = 'count'
HEADER_ID_VAR_NAME = 'headerId'
USER_VAR_NAME = 'user'
USER_ID_VAR_NAME = 'userId'
TIME_VAR_NAME = 'time'
OLD_NAME_VAR_NAME = 'oldName'
IS_ANONYMOUS_VAR_NAME = 'anonymous'
CONTENT_VAR_NAME = 'content'
EVENT_VAR_NAME = 'action'
GENDER_VAR_NAME = 'sex'

REFRESH_USER_EVENT = 'onlineUsers'
SYSTEM_MESSAGE_EVENT = 'system'
GROWL_MESSAGE_EVENT = 'growl'
GET_MESSAGES_EVENT = 'messages'
GET_MINE_USERNAME_EVENT = 'me'
ROOMS_EVENT = 'rooms'  # thread ex "main" , channel ex. 'r:main', "i:3"
LOGIN_EVENT = 'joined'
LOGOUT_EVENT = 'left'
SEND_MESSAGE_EVENT = 'send'
CHANGE_ANONYMOUS_NAME_EVENT = 'changed'

REDIS_USERNAME_CHANNEL_PREFIX = 'u:%s'
REDIS_USERID_CHANNEL_PREFIX = 'i:%s'
REDIS_ROOM_CHANNEL_PREFIX = 'r:%d'
REDIS_ONLINE_USERS = "online_users"


# global connection to read synchronously
sync_redis = redis.StrictRedis()
# Redis connection cannot be shared between publishers and subscribers.
async_redis_publisher = tornadoredis.Client()
async_redis_publisher.connect()
sync_redis.delete(REDIS_ONLINE_USERS)  # TODO move it somewhere else

try:
	anonymous_default_room = Room.objects.get(name=ANONYMOUS_REDIS_ROOM)
except Room.DoesNotExist:
	anonymous_default_room = Room()
	anonymous_default_room.name = ANONYMOUS_REDIS_ROOM
	anonymous_default_room.save()

ANONYMOUS_REDIS_CHANNEL = REDIS_ROOM_CHANNEL_PREFIX % anonymous_default_room.id
ANONYMOUS_ROOM_NAMES = {anonymous_default_room.id: anonymous_default_room.name}

sessionStore = SessionStore()

logger = logging.getLogger(__name__)

# TODO https://github.com/leporo/tornado-redis#connection-pool-support
CONNECTION_POOL = tornadoredis.ConnectionPool(
	max_connections=500,
	wait_for_available=True)


class MessagesCreator(object):

	def __init__(self, *args, **kwargs):
		super(MessagesCreator, self).__init__(*args, **kwargs)
		self.sex = ANONYMOUS_GENDER
		self.sender_name = None
		self.user_id = 0  # anonymous by default

	def online_user_names(self, user_names_dict, action):
		"""
		:type user_names_dict: dict
		:return: { Nick: male, NewName: alien, Joana: female}
		"""
		default_message = self.default(user_names_dict, action)
		default_message.update({
			USER_VAR_NAME: self.sender_name,
			IS_ANONYMOUS_VAR_NAME: self.sex == ANONYMOUS_GENDER
		})
		return default_message

	def change_user_nickname(self, old_nickname, online):
		"""
		set self.sender_name to new nickname before call it
		:return: {action : changed, content: { Nick: male, NewName: alien}, oldName : OldName, user: NewName}
		:type old_nickname: str
		:type online: dict
		"""
		default_message = self.online_user_names(online, CHANGE_ANONYMOUS_NAME_EVENT)
		default_message[OLD_NAME_VAR_NAME] = old_nickname
		return default_message

	@classmethod
	def default(cls, content, event=SYSTEM_MESSAGE_EVENT):
		"""
		:return: {"action": event, "content": content, "time": "20:48:57"}
		"""
		return {
			EVENT_VAR_NAME: event,
			CONTENT_VAR_NAME: content,
			TIME_VAR_NAME: get_milliseconds()
		}

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

	def send_anonymous(self, content, receiver_anonymous, receiver_id):
		default_message = self.default(content, SEND_MESSAGE_EVENT)
		default_message[USER_VAR_NAME] = self.sender_name
		if receiver_anonymous is not None:
			default_message[RECEIVER_USERNAME_VAR_NAME] = receiver_anonymous
			default_message[RECEIVER_USERID_VAR_NAME] = receiver_id
		return default_message

	@property
	def stored_redis_user(self):
		return '%s:%s:%d' % (self.sender_name, self.sex, self.user_id)

	@property
	def channel(self):
		if self.user_id == 0:
			return REDIS_USERNAME_CHANNEL_PREFIX % self.sender_name
		else:
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
			GET_MINE_USERNAME_EVENT: self.process_change_username,
			GET_MESSAGES_EVENT: self.process_get_messages,
			SEND_MESSAGE_EVENT: self.process_send_message,
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
		online = sync_redis.hgetall(REDIS_ONLINE_USERS)
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
		if check_id:
			return result, user_is_online
		else:
			return result

	def add_online_user(self):
		"""
		adds to redis
		online_users = { connection_hash1 = stored_redis_user1, connection_hash_2 = stored_redis_user2 }
		:return:
		"""
		online = self.get_online_from_redis()
		async_redis_publisher.hset(REDIS_ONLINE_USERS, id(self), self.stored_redis_user)
		if self.sender_name not in online:  # if a new tab has been opened
			online.update(self.online_self_js_structure)
			online_user_names_mes = self.online_user_names(online, LOGIN_EVENT)
			self.logger.info('!! First tab, sending refresh online for all')
			self.publish(online_user_names_mes)
		else:  # Send user names to self
			online_user_names_mes = self.online_user_names(online, REFRESH_USER_EVENT)
			self.logger.info('!! Second tab, retrieving online for self')
			self.safe_write(online_user_names_mes)
		# send usernamechat
		username_message = self.default(self.sender_name, GET_MINE_USERNAME_EVENT)
		self.safe_write(username_message)

	def set_username(self, session_key):
		"""
		Case registered: Fetch userName and its channels from database. returns them
		Case anonymous: generates a new name and saves it to session. returns default channel
		:return: channels user should subscribe
		"""
		session = SessionStore(session_key)
		try:
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
		except (KeyError, User.DoesNotExist):
			# Anonymous
			self.sender_name = session.get(SESSION_USER_VAR_KEY)
			if self.sender_name is None:
				self.sender_name = id_generator(8)
				session[SESSION_USER_VAR_KEY] = self.sender_name
				session.save()
				self.logger.info("!! A new user log in, created username %s", self.sender_name)
			else:
				self.logger.info("!! Anonymous with name %s has logged", self.sender_name)
			channels = [ANONYMOUS_REDIS_CHANNEL, self.channel]
			rooms_message = self.default(ANONYMOUS_ROOM_NAMES, ROOMS_EVENT)
		finally:
			self.safe_write(rooms_message)
			return channels

	def publish(self, message, channel=ANONYMOUS_REDIS_CHANNEL):
		jsoned_mess = json.dumps(message)
		self.logger.debug('<%s> %s', channel, jsoned_mess)
		async_redis_publisher.publish(channel, jsoned_mess)

	# TODO really parse every single message for 1 action?
	def check_and_finish_change_name(self, message):
		if self.sex == ANONYMOUS_GENDER:
			parsed_message = json.loads(message)
			if parsed_message[EVENT_VAR_NAME] == CHANGE_ANONYMOUS_NAME_EVENT\
					and parsed_message[OLD_NAME_VAR_NAME] == self.sender_name:
				self.async_redis.unsubscribe(REDIS_USERNAME_CHANNEL_PREFIX % self.sender_name)
				self.sender_name = parsed_message[USER_VAR_NAME]
				self.async_redis.subscribe(REDIS_USERNAME_CHANNEL_PREFIX % self.sender_name)
				async_redis_publisher.hset(REDIS_ONLINE_USERS, id(self), self.stored_redis_user)

	def new_message(self, message):
		if type(message.body) is not int:  # subscribe event
			self.safe_write(message.body)
			self.check_and_finish_change_name(message.body)

	def safe_write(self, message):
		raise NotImplementedError('WebSocketHandler implements')

	def process_send_message(self, message):
		"""
		:type message: dict
		"""
		content = message[CONTENT_VAR_NAME]
		receiver_id = message.get(RECEIVER_USERID_VAR_NAME)  # if receiver_id is None then its a private message
		receiver_name = message.get(RECEIVER_USERNAME_VAR_NAME)
		self.logger.info('!! Sending message %s to username:%s, id:%s', content, receiver_name, receiver_id)
		save_to_db = True
		receiver_channel = None  # public by default
		if receiver_id is not None and receiver_id != 0:
			receiver_channel = REDIS_USERID_CHANNEL_PREFIX % receiver_id
		elif receiver_name is not None:
			receiver_channel = REDIS_USERNAME_CHANNEL_PREFIX % receiver_name
			save_to_db = False
		self.publish_messae(content, receiver_channel, receiver_id, receiver_name, save_to_db)

	def publish_messae(self, content, receiver_channel, receiver_id, receiver_name, save_to_db):
		if self.user_id != 0 and save_to_db:
			self.logger.debug('!! Saving it to db')
			message_db = Message(sender_id=self.user_id, content=content, receiver_id=receiver_id)
			self.do_db(message_db.save)  # exit on hacked id with exception
			prepared_message = self.create_send_message(message_db)
		else:
			self.logger.debug('!! NOT saving it')
			prepared_message = self.send_anonymous(content, receiver_name, receiver_id)
		if receiver_id is None:
			self.logger.debug('!! Detected as public')
			self.publish(prepared_message)
		else:
			self.publish(prepared_message, self.channel)
			self.logger.debug('!! Detected as private, channel %s', receiver_channel)
			if receiver_channel != self.channel:
				self.publish(prepared_message, receiver_channel)

	def process_change_username(self, message):
		"""
		:type message: dict
		"""
		self.logger.info('!! Changing username to %s', message[CONTENT_VAR_NAME])
		new_username = message[CONTENT_VAR_NAME]
		try:
			self.do_db(check_user, new_username)
			online = self.get_online_from_redis()
			if new_username in online:
				self.logger.info('!! This name is already used')
				raise ValidationError('This name is already used by another anonymous!')
			session_key = self.get_cookie(settings.SESSION_COOKIE_NAME)
			session = SessionStore(session_key)
			session[SESSION_USER_VAR_KEY] = new_username
			session.save()
			try:
				del online[self.sender_name]
			except KeyError:  # if two or more change_username events in fast time
				pass
			old_username = self.sender_name
			# temporary set username for creating messages with self.online_self_js_structure, change_user_nickname
			self.sender_name = new_username
			online.update(self.online_self_js_structure)
			message_all = self.change_user_nickname(old_username, online)
			self.sender_name = old_username  # see check_and_finish_change_name
			self.publish(message_all)
		except ValidationError as e:
			self.safe_write(self.default(str(e.message), event=GROWL_MESSAGE_EVENT))

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
		user_id = None if self.user_id == 0 else self.user_id
		anon_name = self.sender_name if self.user_id == 0 else None
		if (self.do_db(UserJoinedInfo.objects.filter(
				Q(ip__ip=self.ip) & Q(anon_name=anon_name) & Q(user_id=user_id)).exists)):
			return
		ip_address = self.get_or_create_ip()
		UserJoinedInfo.objects.create(
			ip=ip_address,
			user_id=user_id,
			anon_name=anon_name
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
					city=response['city']
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
			raise ValidationError("Message can't exceed %s symbols" % MAX_MESSAGE_SIZE)
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
			logger.warning("Message won't be send. Reason: %s", e.message)
			self.safe_write(self.default(e.message))

	def on_close(self):
		try:
			self_id = id(self)
			async_redis_publisher.hdel(REDIS_ONLINE_USERS, self_id)
			if self.connected:
				# seems like async solves problem with connection lost and wrong data status
				# http://programmers.stackexchange.com/questions/294663/how-to-store-online-status
				online, is_online = self.get_online_from_redis(self.sender_name, self_id)
				self.logger.info('!! Closing connection, redis current online %s', online)
				if not is_online:
					message = self.online_user_names(online, LOGOUT_EVENT)
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

	def open(self, *args, **kargs):
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
		x_real_ip = self.request.headers.get("X-Real-IP")
		return x_real_ip or self.request.remote_ip

application = tornado.web.Application([
	(r'.*', TornadoHandler),
])
