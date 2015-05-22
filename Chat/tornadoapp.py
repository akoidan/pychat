import datetime
import json

import tornado.web
import tornado.websocket
from tornado.websocket import WebSocketHandler
import tornado.ioloop
import tornado.httpclient
from django.utils.importlib import import_module
import tornado.gen
from django.conf import settings
import tornadoredis

REFRESH_USER_ACTION = 'online_users'

CONTENT_VAR = 'content'
SYSTEM_MESSAGE = 'system'
ACTION_GET_MINE_USERNAME = 'me'
ACTION_VAR_NAME = 'action'

user_cookie_name = settings.USER_COOKIE_NAME
from story.models import UserProfile, Messages
from story.registration_utils import is_blank, id_generator

session_engine = import_module(settings.SESSION_ENGINE)

# global connection to publishing messages
c = tornadoredis.Client()
c.connect()


class MessagesHandler(WebSocketHandler):

	# Dist of set : {user_name : [Socket1, Socket2] }
	connections = {}

	MAIN_CHANNEL = 'main'

	def refresh_online_user_list(self, action):
		# Creates dict { username: sex, }
		user_names = {user_name: next(iter(self.connections[user_name])) .sex for user_name in self.connections.keys()}
		refresh_message = {
			CONTENT_VAR: user_names,
			ACTION_VAR_NAME: action,
			'user': self.sender_name,
			'time': datetime.datetime.now().strftime("%H:%M:%S")
		}
		self.emit(refresh_message)

	def check_origin(self, origin):
		return True

	def open(self):
		session_key = self.get_cookie(settings.SESSION_COOKIE_NAME)
		if session_key is None:
			self.close()
			# TODO unsubscribe here
		session = session_engine.SessionStore(session_key)
		try:
			self.user_id = session["_auth_user_id"]
			user_db = UserProfile.objects.get(id=self.user_id)
			self.sender_name = user_db.username
			self.sex = user_db.sex_str
		except (KeyError, UserProfile.DoesNotExist):
			# Anonymous
			self.user_id = 0
			try:
				self.sender_name = session['user_name']
			except KeyError:
				self.sender_name = id_generator(8)
				session['user_name'] = self.sender_name
				session.save()
			self.sex = None
		self.connections.setdefault(self.sender_name, set()).add(self)
		# send login action only if there's 1 tab open = 1 just added web socket
		if len(self.connections[self.sender_name]) == 1:
			self.refresh_online_user_list(settings.LOGIN_EVENT)
		else:
			self.refresh_online_user_list(REFRESH_USER_ACTION)
		self.write_message({ACTION_VAR_NAME: ACTION_GET_MINE_USERNAME, CONTENT_VAR: self.sender_name})

	def emit(self, message):
		c.publish(self.MAIN_CHANNEL, json.dumps(message))

	def emit_to_user(self, message, receiver_name):
		for socket in self.connections[receiver_name]:
			socket.write_message(message)

	def emit_to_user_and_self(self, message, receiver_name):
		if receiver_name != self.sender_name:
			try:
				self.emit_to_user(message, receiver_name)
			# if user left the chat ( all ws are closed)
			except KeyError:
				error_message = {
					ACTION_VAR_NAME: SYSTEM_MESSAGE,
					CONTENT_VAR: "Can't send the message, User has left the chat.",
					'time': datetime.datetime.now().strftime("%H:%M:%S")
				}
				self.emit_to_user(error_message, self.sender_name)
		self.emit_to_user(message, self.sender_name)

	def __init__(self, *args, **kwargs):
		super(MessagesHandler, self).__init__(*args, **kwargs)
		self.listen()

	@tornado.gen.engine
	def listen(self):
		self.client = tornadoredis.Client()
		self.client.connect()
		yield tornado.gen.Task(self.client.subscribe, self.MAIN_CHANNEL)
		self.client.listen(self.new_message)

	def new_message(self, message):
		if type(message.body) is str:
			self.write_message(message.body)

	def detect_message_type(self, receiver_name):
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

	def on_message(self, json_message):
		if not json_message:
			return
		if len(json_message) > 10000:
			return
		message = json.loads(json_message)

		receiver_name = message['receiver']
		content = message['message']
		receiver, receiver_name, save_to_db, send_to_all = self.detect_message_type(receiver_name)

		if save_to_db:
			message_db = Messages(sender_id=self.user_id, content=content, receiver=receiver)
			message_db.save()
			prepared_message = message_db.json
		else:
			prepared_message = Messages.json_anonymous(self.sender_name, content, receiver_name)

		if send_to_all:
			self.emit(prepared_message)
		else:
			self.emit_to_user_and_self(prepared_message, receiver_name)

	def on_close(self):
		if self.client.subscribed:
			self.client.unsubscribe(self.MAIN_CHANNEL)
			self.client.disconnect()
		try:
			self.connections[self.sender_name].discard(self)
			# if set is empty = last web socket is gone
			if not self.connections[self.sender_name]:
				# set is empty but the key is still in dict, so username present in list
				del self.connections[self.sender_name]
				self.refresh_online_user_list(settings.LOGOUT_EVENT)
		# if dict doesn't have element
		except KeyError:
			pass


application = tornado.web.Application([
	(r'.*', MessagesHandler),
])
