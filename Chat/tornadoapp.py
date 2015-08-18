import datetime
import json
import logging
import sys
from django.core.exceptions import ValidationError

import redis
from django.db.models import Q
import tornado.web
import tornado.websocket
from tornado.websocket import WebSocketHandler
import tornado.ioloop
import tornado.httpclient
from django.utils.importlib import import_module
import tornado.gen
from django.conf import settings
import tornadoredis
from django.db import connection, OperationalError, InterfaceError


try:
	from urllib.parse import urlparse  # py2
except ImportError:
	from urlparse import urlparse  # py3

from Chat.settings import MAX_MESSAGE_SIZE, ANONYMOUS_REDIS_ROOM
from story.models import UserProfile, Message, Room
from story.registration_utils import id_generator, check_user, is_blank

PY3 = sys.version > '3'

session_engine = import_module(settings.SESSION_ENGINE)
user_cookie_name = settings.USER_COOKIE_NAME

ANONYMOUS_GENDER = 'Alien'
MESSAGE_ID_VAR_NAME = 'id'
RECEIVER_USERNAME_VAR_NAME = 'receiverName'
RECEIVER_USERID_VAR_NAME = 'receiverId'
COUNT_VAR_NAME = 'count'
HEADER_ID_VAR_NAME = 'headerId'
SESSION_USER_VAR_NAME = 'user_name'
USER_VAR_NAME = 'user'
USER_ID_VAR_NAME = 'id'
TIME_VAR_NAME = 'time'
OLD_NAME_VAR_NAME = 'oldName'
IS_ANONYMOUS_VAR_NAME = 'anonymous'
CONTENT_VAR_NAME = 'content'
EVENT_VAR_NAME = 'action'
GENDER_VAR_NAME = 'sex'
REFRESH_USER_EVENT = 'online_users'
SYSTEM_MESSAGE_EVENT = 'system'
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

anonymous_default_room = Room.objects.get(name=ANONYMOUS_REDIS_ROOM)
ANONYMOUS_REDIS_CHANNEL = REDIS_ROOM_CHANNEL_PREFIX % anonymous_default_room.id
ANONYMOUS_ROOM_NAMES = {anonymous_default_room.id: anonymous_default_room.name}

sessionStore = session_engine.SessionStore()

logger = logging.getLogger(__name__)

# TODO https://github.com/leporo/tornado-redis#connection-pool-support
CONNECTION_POOL = tornadoredis.ConnectionPool(
	max_connections=500,
	wait_for_available=True)


class MessagesCreator(object):

	def __init__(self):
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

	@staticmethod
	def default(content, event=SYSTEM_MESSAGE_EVENT):
		"""
		:return: {"action": event, "content": content, "time": "20:48:57"}
		"""
		return {
			EVENT_VAR_NAME: event,
			CONTENT_VAR_NAME: content,
			TIME_VAR_NAME: datetime.datetime.now().strftime("%H:%M:%S")
		}

	@classmethod
	def create_send_message(cls, message):
		"""
		:type message: Message
		"""
		result = cls.get_message(message)
		result[EVENT_VAR_NAME] = SEND_MESSAGE_EVENT
		return result

	@staticmethod
	def get_message(message):
		"""
		:param message:
		:return: "action": "joined", "content": {"v5bQwtWp": "alien", "tRD6emzs": "Alien"},
		"sex": "Alien", "user": "tRD6emzs", "time": "20:48:57"}
		"""
		result = {
			USER_VAR_NAME: message.sender.username,
			CONTENT_VAR_NAME: message.content,
			TIME_VAR_NAME: message.time.strftime("%H:%M:%S"),
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

	def send_anonymous(self, content, receiver_anonymous):
		default_message = self.default(content, SEND_MESSAGE_EVENT)
		default_message[USER_VAR_NAME] = self.sender_name
		if receiver_anonymous is not None:
			default_message[RECEIVER_USERNAME_VAR_NAME] = receiver_anonymous
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

	@staticmethod
	def do_db(callback, **args):
		try:
			return callback(**args)
		except (OperationalError, InterfaceError) as e:  # Connection has gone away
			logger.warn('%s, reconnecting' % e)
			connection.close()
			return callback(**args)


class MessagesHandler(WebSocketHandler, MessagesCreator):


	def data_received(self, chunk):
		pass

	def __init__(self, *args, **kwargs):
		super(MessagesHandler, self).__init__(*args, **kwargs)
		self.async_redis = tornadoredis.Client()
		self.process_message = {
			GET_MINE_USERNAME_EVENT: self.process_change_username,
			GET_MESSAGES_EVENT: self.process_get_messages,
			SEND_MESSAGE_EVENT: self.process_send_message,
		}

	@tornado.gen.engine
	def listen(self, channels):
		"""
		self.channel should been set before calling
		"""
		yield tornado.gen.Task(
			self.async_redis.subscribe, channels)
		self.async_redis.listen(self.new_message)

	@classmethod
	def get_online_from_redis(cls):
		"""
		:rtype : dict
		"""
		online = sync_redis.hvals(REDIS_ONLINE_USERS)
		result = {}
		# redis stores REDIS_USER_FORMAT, so parse them
		if online:
			for raw_user_sex in online:
				(name, sex, user_id) = raw_user_sex.decode('utf-8').split(':')
				result.update(cls.online_js_structure(name, sex, user_id))
		return result

	def add_online_user(self):
		online = self.get_online_from_redis()
		async_redis_publisher.hset(REDIS_ONLINE_USERS, id(self), self.stored_redis_user)
		first_tab = False
		if self.sender_name not in online:  # if a new tab has been opened
			online.update(self.online_self_js_structure)
			first_tab = True

		if first_tab:  # Login event, sent user names to all
			online_user_names_mes = self.online_user_names(online, LOGIN_EVENT)
			self.publish(online_user_names_mes)
		else:  # Send user names to self
			online_user_names_mes = self.online_user_names(online, REFRESH_USER_EVENT)
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
		session = session_engine.SessionStore(session_key)
		try:
			self.user_id = int(session["_auth_user_id"])
			user_db = self.do_db(UserProfile.objects.get, id=self.user_id) # everything but 0 is a registered user
			self.sender_name = user_db.username
			self.sex = user_db.sex_str
			logger.debug("User %s has logged in with session key %s" % (self.sender_name, session_key))
			rooms = user_db.rooms.all()  # do_db is used already
			logger.debug('fetched %s for user %s' % (rooms, user_db.username))
			room_names = {}
			channels = [self.channel, ]
			for thread in rooms:
				room_names[thread.id] = thread.name
				channels.append(REDIS_ROOM_CHANNEL_PREFIX % thread.id)
			rooms_message = self.default(room_names, ROOMS_EVENT)
		except (KeyError, UserProfile.DoesNotExist):
			# Anonymous
			self.sender_name = session.get(SESSION_USER_VAR_NAME)
			if self.sender_name is None:
				self.sender_name = id_generator(8)
				session[SESSION_USER_VAR_NAME] = self.sender_name
				session.save()
				logger.debug("Generated %s  name for new anonymous session %s" % (self.sender_name, session_key))
			else:
				logger.debug("Anonymous %s has logged in with session key %s" % (self.sender_name, session_key))
			channels = [ANONYMOUS_REDIS_CHANNEL, self.channel]
			rooms_message = self.default(ANONYMOUS_ROOM_NAMES, ROOMS_EVENT)
		finally:
			self.safe_write(rooms_message)
			return channels

	def open(self):
		session_key = self.get_cookie(settings.SESSION_COOKIE_NAME)
		if sessionStore.exists(session_key):
			self.async_redis.connect()
			channels = self.set_username(session_key)
			self.listen(channels)
			self.add_online_user()
		else:
			logger.warn('Incorrect session id: %s', session_key)
			self.close(403, "Session key is empty or session doesn't exist")

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

	@staticmethod
	def publish(message, channel=ANONYMOUS_REDIS_CHANNEL):
		async_redis_publisher.publish(channel, json.dumps(message))

	# TODO really parse every single message for 1 action?
	def check_and_finish_change_name(self, message):
		if self.sex == ANONYMOUS_GENDER:
			parsed_message = json.loads(message)
			if parsed_message[EVENT_VAR_NAME] == GET_MINE_USERNAME_EVENT:
				self.async_redis.unsubscribe(REDIS_USERNAME_CHANNEL_PREFIX % self.sender_name)  # TODO is it allowed?
				self.sender_name = parsed_message[CONTENT_VAR_NAME]
				self.async_redis.subscribe(REDIS_USERNAME_CHANNEL_PREFIX % self.sender_name)
				async_redis_publisher.hset(REDIS_ONLINE_USERS, id(self), self.stored_redis_user)

	def new_message(self, message):
		if type(message.body) is not int:  # subscribe event
			self.safe_write(message.body)
			self.check_and_finish_change_name(message.body)

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
			self.write_message(message)
		except tornado.websocket.WebSocketClosedError:
			logger.error(
				'Socket "%s" closed bug, this "%s" message: "%s"',
				str(self),
				self.sender_name,
				str(message))

	def process_send_message(self, message):
		"""
		:type message: dict
		"""
		content = message[CONTENT_VAR_NAME]
		receiver_id = message.get(RECEIVER_USERID_VAR_NAME)  # if receiver_id is None then its a private message
		receiver_name = message.get(RECEIVER_USERNAME_VAR_NAME)
		save_to_db = True
		if receiver_id is not None and receiver_id != 0:
			receiver_channel = REDIS_USERID_CHANNEL_PREFIX % receiver_id
		elif receiver_name is not None:
			receiver_channel = REDIS_USERNAME_CHANNEL_PREFIX % receiver_name
			save_to_db = False

		if self.user_id != 0 and save_to_db:
			message_db = Message(sender_id=self.user_id, content=content, receiver_id=receiver_id)
			self.do_db(message_db.save)  # exit on hacked id with exception
			prepared_message = self.create_send_message(message_db)
		else:
			prepared_message = self.send_anonymous(content, receiver_name)

		if receiver_id is None:
			self.publish(prepared_message)
		else:
			self.publish(prepared_message, self.channel)
			if receiver_channel != self.channel:
				self.publish(prepared_message, receiver_channel)

	def process_change_username(self, message):
		"""
		:type message: dict
		"""
		new_username = message[CONTENT_VAR_NAME]
		try:
			check_user(new_username)
			online = self.get_online_from_redis()
			if new_username in online:
				raise ValidationError('Anonymous already has this name')
			session_key = self.get_cookie(settings.SESSION_COOKIE_NAME)
			session = session_engine.SessionStore(session_key)
			session[SESSION_USER_VAR_NAME] = new_username
			session.save()

			del online[self.sender_name]
			old_name = self.sender_name
			old_channel = self.channel
			self.sender_name = new_username  # change_user_name required new_username in sender_name
			online.update(self.online_self_js_structure)
			message_all = self.change_user_nickname(old_name, online)
			message_me = self.default(new_username, GET_MINE_USERNAME_EVENT)
			# TODO perform ton of checks or emit twice ?
			self.publish(message_me, self.channel)  # to new user channel
			self.publish(message_me, old_channel)  # to old user channel
			self.publish(message_all)
		except ValidationError as e:
			self.safe_write(self.default(str(e.message)))

	def on_message(self, json_message):
		if json_message and len(json_message) < MAX_MESSAGE_SIZE:
			message = json.loads(json_message)
			self.process_message[message.get(EVENT_VAR_NAME)](message)

	def on_close(self):
		try:
			if self.sender_name:
				sync_redis.hdel(REDIS_ONLINE_USERS, id(self))
				online = self.get_online_from_redis()
				if self.sender_name not in online:
					message = self.online_user_names(online, LOGOUT_EVENT)
					self.publish(message)
		finally:
			if self.async_redis.subscribed:
				#  TODO unsubscribe of all subscribed                  !IMPORTANT
				self.async_redis.unsubscribe([
					REDIS_ROOM_CHANNEL_PREFIX % ANONYMOUS_REDIS_ROOM,
					REDIS_USERNAME_CHANNEL_PREFIX % self.sender_name
				])
			self.async_redis.disconnect()

	def process_get_messages(self, data):
		"""
		:type data: dict
		"""
		header_id = data.get(HEADER_ID_VAR_NAME, None)
		count = int(data.get(COUNT_VAR_NAME, 10))
		if header_id is None:
			messages = Message.objects.filter(
				Q(receiver=None)  # Only public
				| Q(sender=self.user_id)  # private s
				| Q(receiver=self.user_id)  # and private
			).order_by('-pk')[:count]
		else:
			messages = Message.objects.filter(
				Q(id__lt=header_id),
				Q(receiver=None)
				| Q(sender=self.user_id)
				| Q(receiver=self.user_id)
			).order_by('-pk')[:count]
		response = self.get_messages(messages)
		self.safe_write(response)


application = tornado.web.Application([
	(r'.*', MessagesHandler),
])
