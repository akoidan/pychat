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

user_cookie_name = settings.USER_COOKIE_NAME
from story.models import UserProfile, Messages
from story.registration_utils import is_blank, id_generator

session_engine = import_module(settings.SESSION_ENGINE)

# global connection to publishing messages
c = tornadoredis.Client()
c.connect()


class MessagesHandler(WebSocketHandler):
	connections = {}

	MAIN_CHANNEL = 'main'

	def refresh_online_user_list(self, action):
		user_names = {user_name: self.connections[user_name].sex for user_name in self.connections.keys()}
		refresh_message = {
			'onlineUsers': user_names,
			'action': action,
			'user': self.sender_name,
			'time': datetime.datetime.now().strftime("%H:%M:%S")
		}
		self.emit(refresh_message)

	def check_origin(self, origin):
		return True

	def open(self):
		session_key = self.get_cookie(settings.SESSION_COOKIE_NAME)
		session = session_engine.SessionStore(session_key)
		try:
			self.user_id = session["_auth_user_id"]
			user_db = UserProfile.objects.get(id=self.user_id)
			self.sender_name = user_db.username
			self.sex = user_db.sex_str
		except (KeyError, UserProfile.DoesNotExist):
			# Anonymous
			self.user_id = 0
			self.sender_name = id_generator(8)
			self.sex = None
		self.connections[self.sender_name] = self
		self.refresh_online_user_list(settings.LOGIN_EVENT)
		self.write_message({'me': self.sender_name})

	def emit(self, message):
		c.publish(self.MAIN_CHANNEL, json.dumps(message))

	def emit_to_user(self, message, receiver_name):
		self.write_message(message)
		if receiver_name != self.sender_name:
			self.connections[receiver_name].write_message(message)

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

	def on_message(self, json_message):
		if not json_message:
			return
		if len(json_message) > 10000:
			return
		message = json.loads(json_message)

		receiver_name = message['receiver']
		content = message['message']
		save_to_db = False
		receiver = None
		send_to_all = is_blank(receiver_name)
		if send_to_all:
			receiver_name = None

		if self.user_id != 0:
			if not send_to_all:
				try:
					receiver = UserProfile.objects.get(username=receiver_name)
					save_to_db = True
				except UserProfile.DoesNotExist:
					pass
			else:
				save_to_db = True

		if save_to_db:
			message_db = Messages(sender_id=self.user_id, content=content, receiver=receiver)
			message_db.save()
			prepared_message = message_db.json
		else:
			prepared_message = Messages.json_anonymous(self.sender_name, content, receiver_name)

		if send_to_all:
			self.emit(prepared_message)
		else:
			self.emit_to_user(prepared_message, receiver_name)

	def on_close(self):
		if self.client.subscribed:
			self.client.unsubscribe(self.MAIN_CHANNEL)
			self.client.disconnect()
		try:
			del self.connections[self.sender_name]
			self.refresh_online_user_list(settings.LOGOUT_EVENT)
		except AttributeError:
			pass


application = tornado.web.Application([
	(r'.*', MessagesHandler),
])
