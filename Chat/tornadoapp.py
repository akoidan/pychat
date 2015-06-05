from abc import abstractmethod, abstractproperty
import datetime
import json
import logging

from django.core.exceptions import ValidationError
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
from story.registration_utils import is_blank, id_generator, check_user


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
MAIN_CHANNEL = 'main'


# global connection to publishing messages
c = tornadoredis.Client()
c.connect()

# Dist of set : {user_name : [Socket1, Socket2] }
connections = {}
sessionStore = session_engine.SessionStore()

logger = logging.getLogger(__name__)


class MessagesCreator(object):

	def __init__(self):
		self.sex = ANONYMOUS_GENDER
		self.sender_name = ''
		self.user_id = 0

	@staticmethod
	def online_usernames_sex_dict():
		return {user_name: next(iter(connections[user_name])).sex for user_name in connections.keys()}

	def online_user_names(self, action):
		user_names = self.online_usernames_sex_dict()
		default_message = self.default(user_names, action)
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
		self.client = tornadoredis.Client()
		self.client.connect()
		self.listen()

	@tornado.gen.engine
	def listen(self):
		yield tornado.gen.Task(self.client.subscribe, MAIN_CHANNEL)
		self.client.listen(self.new_message)

	def refresh_client_username(self):
		# TODO why send to all when only get on load page for yourself?
		message = self.default(self.sender_name, GET_MINE_USERNAME_EVENT)
		self.emit_to_user(message)

	def open(self):
		session_key = self.get_cookie(settings.SESSION_COOKIE_NAME)
		if session_key is None or not sessionStore.exists(session_key):
			logger.warn('SessionKey ' + session_key + ' is absent')
			self.close(403, "Session key is empty or session doesn't exist")
			return
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
		connections.setdefault(self.sender_name, set()).add(self)
		#  send login action only if there's 1 tab open = 1 just added web socket
		if len(connections[self.sender_name]) == 1:
			self.refresh_online_user_list(LOGIN_EVENT)
		else:  # if a new tab has been opened
			online_user_names = self.online_user_names(REFRESH_USER_EVENT)
			self.write_message(online_user_names)
		self.refresh_client_username()

	def refresh_online_user_list(self, action):
		# Creates dict { username: sex, }
		message = self.online_user_names(
			action)
		self.emit(message)

	def check_origin(self, origin):
		return True

	@staticmethod
	def emit(message):
		c.publish(MAIN_CHANNEL, json.dumps(message))

	def emit_to_user(self, message, receiver_name=None):
		"""
		:param receiver_name: if None send to itself
		:return: None
		"""
		if receiver_name is None:
			receiver_name = self.sender_name
		for socket in connections[receiver_name]:
			self.safe_write(socket, message)

	def emit_to_user_and_self(self, message, receiver_name):
		if receiver_name != self.sender_name:
			try:
				self.emit_to_user(message, receiver_name)
			# if user left the chat ( all ws are closed)
			except KeyError:
				self.emit_to_user(
					self.default("Can't send the message, User has left the chat."),
				)
		self.emit_to_user(message)

	def new_message(self, message):
		if type(message.body) is not int:  # subscribe event
			self.safe_write(self, message.body)

	@staticmethod
	def safe_write(socket, message):
		"""
		Tries to send message, doesn't throw exception outside
		:type socket: MessagesHandler
		"""
		try:
			socket.write_message(message)
		except tornado.websocket.WebSocketClosedError:
			logger.error(
				'Socket "{0}" closed bug, this "{1}" connections: "{2}" message: "{3}"'.format(
					str(socket),
					socket.sender_name,
					str(connections),
					str(message)))

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
			self.emit(prepared_message)
		else:
			self.emit_to_user_and_self(prepared_message, receiver_name)

	def change_username(self, message):
		"""
		:type message: dict
		"""
		new_username = message[GET_MINE_USERNAME_EVENT]
		try:
			check_user(new_username)
			if new_username in connections.keys():
				raise ValidationError('Anonymous already has this name')
			# replace username in dict usernames
			connections[new_username] = connections.pop(self.sender_name)
			# change sender_name
			old_username, self.sender_name = self.sender_name, new_username

			session_key = self.get_cookie(settings.SESSION_COOKIE_NAME)
			session = session_engine.SessionStore(session_key)
			session[SESSION_USER_VAR_NAME] = new_username
			session.save()
			message = self.change_user_nickname(old_username)
			self.emit(message)
			self.refresh_client_username()
		except ValidationError as e:
			self.safe_write(self, self.default(str(e.message)))

	def on_message(self, json_message):
		if not json_message:
			return
		if len(json_message) > MAX_MESSAGE_SIZE:
			return
		message = json.loads(json_message)
		action = message.get(EVENT_VAR_NAME)
		if action == GET_MINE_USERNAME_EVENT:
			self.change_username(message)
		elif action == GET_MESSAGES_EVENT:
			self.process_get_messages(message)
		elif action == SEND_MESSAGE_EVENT:  # None
			self.process_send_message(message)
		else:
			raise Exception('unclassified message type:' + json_message)

	def on_close(self):
		if self.client.subscribed:
			self.client.unsubscribe(MAIN_CHANNEL)
			self.client.disconnect()
		try:
			connections[self.sender_name].discard(self)
			# if set is empty = last web socket is gone
			if not connections[self.sender_name]:
				# set is empty but the key is still in dict, so username present in list
				del connections[self.sender_name]
				self.refresh_online_user_list(LOGOUT_EVENT)
		# if dict doesn't have element
		except KeyError:
			pass

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
		self.safe_write(self, response)


application = tornado.web.Application([
	(r'.*', MessagesHandler),
])
