import datetime
import json
import logging
import redis

try:
	from urllib.parse import urlparse  # py2
except ImportError:
	from urlparse import urlparse  # py3

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

from Chat.settings import MAX_MESSAGE_SIZE
from story.models import UserProfile, Messages
from story.registration_utils import is_blank, id_generator


session_engine = import_module(settings.SESSION_ENGINE)
user_cookie_name = settings.USER_COOKIE_NAME

ANONYMOUS_GENDER = 'alien'
MESSAGE_ID_VAR_NAME = 'id'
RECEIVER_USERNAME_VAR_NAME = 'receiver'
COUNT_VAR_NAME = 'count'
HEADER_ID_VAR_NAME = 'headerId'
SESSION_USER_VAR_NAME = 'user_name'
USER_VAR_NAME = 'user'
TIME_VAR_NAME = 'time'
OLD_NAME_VAR_NAME = 'oldName'
CONTENT_VAR_NAME = 'content'
EVENT_VAR_NAME = 'action'
GENDER_VAR_NAME = 'sex'
REFRESH_USER_EVENT = 'online_users'
SYSTEM_MESSAGE_EVENT = 'system'
GET_MESSAGES_EVENT = 'messages'
GET_MINE_USERNAME_EVENT = 'me'
LOGIN_EVENT = 'joined'
LOGOUT_EVENT = 'left'
SEND_MESSAGE_EVENT = 'send'
CHANGE_ANONYMOUS_NAME_EVENT = 'changed'
REDIS_MAIN_CHANNEL = 'main'
REDIS_USER_CHANNEL_PREFIX = 'user:%s'
REDIS_ONLINE_USERS = "online_users"


# global connection to read synchronously
sync_redis = redis.StrictRedis()
# Redis connection cannot be shared between publishers and subscribers.
async_redis_publisher = tornadoredis.Client()
async_redis_publisher.connect()

sessionStore = session_engine.SessionStore()

logger = logging.getLogger(__name__)

# TODO https://github.com/leporo/tornado-redis#connection-pool-support
CONNECTION_POOL = tornadoredis.ConnectionPool(
	max_connections=500,
	wait_for_available=True)


class MessagesCreator(object):

	def __init__(self):
		self.sex = ANONYMOUS_GENDER
		self.sender_name = ''
		self.user_id = 0

	def parse_redis_users(self, user_names):
		user_sex_dict = {}
		if user_names is not None:
			for a in user_names:
				b = a.split(':')
				user_sex_dict[b[0]] = b[1]
		else:
			raise NotImplementedError("Usernames in None")  # TODO
		return user_sex_dict

	def online_user_names(self, action, user_names=set(sync_redis.hvals(REDIS_ONLINE_USERS))):

		user_sex_dict = self.parse_redis_users(user_names)
		default_message = self.default(user_sex_dict, action)
		default_message.update({
			USER_VAR_NAME: self.sender_name,
			GENDER_VAR_NAME: self.sex
		})
		return default_message

	def change_user_nickname(self, old_nickname):
		default_message = self.online_user_names(CHANGE_ANONYMOUS_NAME_EVENT)
		default_message.update({OLD_NAME_VAR_NAME: old_nickname})
		return default_message

	@staticmethod
	def default(content, event=SYSTEM_MESSAGE_EVENT):
		return {
			EVENT_VAR_NAME: event,
			CONTENT_VAR_NAME: content,
			TIME_VAR_NAME: datetime.datetime.now().strftime("%H:%M:%S")
		}

	def create_send_message(self, message):
		"""
		:type message: Messages
		"""
		result = self.get_message(message)
		result.update({
			EVENT_VAR_NAME: SEND_MESSAGE_EVENT
		})
		return result

	@staticmethod
	def get_message(message):
		return {
			USER_VAR_NAME: message.sender.username,
			RECEIVER_USERNAME_VAR_NAME: None if message.receiver is None else message.receiver.username,
			CONTENT_VAR_NAME: message.content,
			TIME_VAR_NAME: message.time.strftime("%H:%M:%S"),
			MESSAGE_ID_VAR_NAME: message.id,
		}

	def get_messages(self, messages):
		"""
		:type messages: list[Messages]
		:type messages: QuerySet[Messages]
		"""
		return {
			CONTENT_VAR_NAME: [self.create_send_message(message) for message in messages],
			EVENT_VAR_NAME: GET_MESSAGES_EVENT
		}

	def send_anonymous(self, content, receiver_anonymous):
		default_message = self.default(content, SEND_MESSAGE_EVENT)
		default_message.update({
			USER_VAR_NAME: self.sender_name,
			RECEIVER_USERNAME_VAR_NAME: receiver_anonymous,
		})
		return default_message


class MessagesHandler(WebSocketHandler, MessagesCreator):

	def data_received(self, chunk):
		pass

	def __init__(self, *args, **kwargs):
		super(MessagesHandler, self).__init__(*args, **kwargs)
		self.async_redis = tornadoredis.Client()
		self.process_message = {
			GET_MINE_USERNAME_EVENT: self.change_username,
			GET_MESSAGES_EVENT: self.process_get_messages,
			SEND_MESSAGE_EVENT: self.process_send_message,
		}

	@tornado.gen.engine
	def listen(self):
		yield tornado.gen.Task(self.async_redis.subscribe, [REDIS_MAIN_CHANNEL, REDIS_USER_CHANNEL_PREFIX % self.sender_name])
		self.async_redis.listen(self.new_message)

	@property
	def online_entry(self):
		return '%s:%s' % (self.sender_name, self.sex)

	def add_online_user(self):
		online = sync_redis.hvals(REDIS_ONLINE_USERS)
		self.async_redis.hset(REDIS_ONLINE_USERS, id(self), self.online_entry)  # TODO check if it works
		first_tab = False
		if not online:  # if he's the only user online
			online = [self.online_entry, ]
		elif self.sender_name not in online:  # if a new tab has been opened
			online.add(self.online_entry)
			first_tab = True

		if first_tab:  # Login event, sent user names to all
			online_user_names_mes = self.online_user_names(LOGIN_EVENT, online)
			async_redis_publisher.publish(REDIS_MAIN_CHANNEL, online_user_names_mes)
		else:  # Send user names to self
			online_user_names_mes = self.online_user_names(REFRESH_USER_EVENT, online)
			self.safe_write(online_user_names_mes)
		# send username
		self.safe_write(self.default(self.sender_name, GET_MINE_USERNAME_EVENT))

	def set_username(self, session_key):
		session = session_engine.SessionStore(session_key)
		try:
			self.user_id = session["_auth_user_id"]
			user_db = UserProfile.objects.get(id=self.user_id)
			self.sender_name = user_db.username
			self.sex = user_db.sex_str
		except (KeyError, UserProfile.DoesNotExist):
			# Anonymous
			try:
				self.sender_name = session[SESSION_USER_VAR_NAME]
			except KeyError:
				self.sender_name = id_generator(8)
				session[SESSION_USER_VAR_NAME] = self.sender_name
				session.save()

	def open(self):
		session_key = self.get_cookie(settings.SESSION_COOKIE_NAME)
		if sessionStore.exists(session_key):
			self.async_redis.connect()
			self.set_username(session_key)
			self.listen()
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
	def publish(message, channel=REDIS_MAIN_CHANNEL):
		async_redis_publisher.publish(channel, json.dumps(message))

	def emit_to_user(self, message, receiver_name=None):
		"""
		:param receiver_name: if None send to itself
		:return: None
		"""
		if receiver_name is None:
			receiver_name = self.sender_name
		self.publish(message, REDIS_USER_CHANNEL_PREFIX % self.sender_name)

	def emit_to_user_and_self(self, message, receiver_name):
		if receiver_name != self.sender_name:
			try:
				self.emit_to_user(message, receiver_name)
			# if user left the chat ( all ws are closed)
			except KeyError:
				self.emit_to_user(
					self.default("Can't send the message, User has left the chat."),
				)
		# TODO send message to myself doesn't work
		self.emit_to_user(message)

	def new_message(self, message):
		if type(message.body) is not int:  # subscribe event
			self.safe_write(message.body)

	def safe_write(self, message):
		"""
		Tries to send message, doesn't throw exception outside
		:type self: MessagesHandler
		"""
		try:
			self.write_message(message)
		except tornado.websocket.WebSocketClosedError:
			logger.error(
				'Socket "%s" closed bug, this "%s" message: "%s"',
				str(self),
				self.sender_name,
				str(message))

	def detect_message_type(self, receiver_name):
		"""
		:type receiver_name: str
		"""
		save_to_db = False
		receiver = None
		send_to_all = is_blank(receiver_name)
		if send_to_all:
			receiver_name = None
		if self.user_id != 0:
			if not send_to_all:
				try:
					# TODO is that really necessary to fetch username from db on message event
					receiver = UserProfile.objects.get(username=receiver_name)
					save_to_db = True
				except UserProfile.DoesNotExist:
					pass
			else:
				save_to_db = True
		return receiver, receiver_name, save_to_db, send_to_all

	def process_send_message(self, message):
		"""
		:type message: dict
		"""
		receiver_name = message[RECEIVER_USERNAME_VAR_NAME]
		content = message[CONTENT_VAR_NAME]
		receiver, receiver_name, save_to_db, send_to_all = self.detect_message_type(receiver_name)
		if save_to_db:
			message_db = Messages(sender_id=self.user_id, content=content, receiver=receiver)
			message_db.save()
			prepared_message = self.create_send_message(message_db)
		else:
			prepared_message = self.send_anonymous(content, receiver_name)
		if send_to_all:
			self.publish(prepared_message)
		else:
			self.emit_to_user_and_self(prepared_message, receiver_name)

	def change_username(self, message):
		"""
		:type message: dict
		"""
		logger.warn("not supported change username yet")  # TODO
		# new_username = message[GET_MINE_USERNAME_EVENT]
		# try:
		# 	check_user(new_username)
		# 	if new_username in connections.keys():
		# 		raise ValidationError('Anonymous already has this name')
		# 	# replace username in dict usernames
		# 	connections[new_username] = connections.pop(self.sender_name)
		# 	# change sender_name
		# 	old_username, self.sender_name = self.sender_name, new_username
		#
		# 	session_key = self.get_cookie(settings.SESSION_COOKIE_NAME)
		# 	session = session_engine.SessionStore(session_key)
		# 	session[SESSION_USER_VAR_NAME] = new_username
		# 	session.save()
		# 	message = self.change_user_nickname(old_username)
		# 	self.publish(message)
		# 	message = self.default(self.sender_name, GET_MINE_USERNAME_EVENT)
		# 	self.emit_to_user(message)
		# except ValidationError as e:
		# 	self.safe_write(self.default(str(e.message)))

	def on_message(self, json_message):
		if json_message and len(json_message) < MAX_MESSAGE_SIZE:
			message = json.loads(json_message)
			self.process_message[message.get(EVENT_VAR_NAME)](message)

	def on_close(self):
		try:
			sync_redis.hdel(REDIS_ONLINE_USERS, id(self))
			message = self.online_user_names(LOGOUT_EVENT)
			self.publish(message)
		finally:
			if self.async_redis.subscribed:
				self.async_redis.unsubscribe(REDIS_MAIN_CHANNEL)
				self.async_redis.unsubscribe(REDIS_USER_CHANNEL_PREFIX % self.sender_name)
			self.async_redis.disconnect()

	def process_get_messages(self, data):
		"""
		:type data: dict
		"""
		header_id = data.get(HEADER_ID_VAR_NAME, None)
		count = int(data.get(COUNT_VAR_NAME, 10))
		if header_id is None:
			messages = Messages.objects.filter(
				Q(receiver=None)  # Only public
				| Q(sender=self.user_id)  # private s
				| Q(receiver=self.user_id)  # and private
			).order_by('-pk')[:count]
		else:
			messages = Messages.objects.filter(
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
