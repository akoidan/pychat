import datetime
import json

import tornado.web
import tornado.websocket
import tornado.ioloop
import tornado.httpclient
from django.conf import settings
from django.utils.importlib import import_module
import tornadoredis

from story.models import UserProfile, Messages
from story.registration_utils import is_blank


session_engine = import_module(settings.SESSION_ENGINE)

from django.contrib.auth.models import User


c = tornadoredis.Client()
c.connect()


class MessagesHandler(tornado.websocket.WebSocketHandler):

	connections = set()

	def emit(self, message):
		[con.write_message(message) for con in self.connections]

	def __init__(self, *args, **kwargs):
		super(MessagesHandler, self).__init__(*args, **kwargs)
		self.client = tornadoredis.Client()
		self.client.connect()

	def check_origin(self, origin):
		return True

	def open(self, thread_id):
		self.connections.add(self)
		session_key = self.get_cookie(settings.SESSION_COOKIE_NAME)
		session = session_engine.SessionStore(session_key)
		try:
			self.user_id = session["_auth_user_id"]
			self.sender_name = UserProfile.objects.get(id=self.user_id).username
		except (KeyError, User.DoesNotExist):
			self.close()
			return
		# if not Thread.objects.filter(
		# 		id=thread_id,
		# 		participants__id=self.user_id
		# ).exists():
		# 	self.close()
		# 	return
		self.channel = "".join(['thread_', thread_id, '_messages'])
		self.client.subscribe(self.channel)
		self.thread_id = thread_id
		self.client.listen(self.show_new_message)

	def handle_request(self, response):
		pass

	def on_message(self, json_message):
		if not json_message:
			return
		if len(json_message) > 10000:
			return
		message = json.loads(json_message)
		if is_blank(message['receiver']):
			receiver = None
		else:
			receiver = UserProfile.objects.get(username=message['receiver'])
		message_db = Messages(sender_id=self.user_id, content=message['message'], receiver=receiver)
		message_db.save()

		self.emit(message_db.json)

	def show_new_message(self, result):
		self.write_message(str(result.body))

	def on_close(self):
		self.connections.remove(self)
		try:
			self.client.unsubscribe(self.channel)
		except AttributeError:
			pass

		def check():
			if self.client.connection.in_progress:
				tornado.ioloop.IOLoop.instance().add_timeout(
					datetime.timedelta(0.00001),
					check
				)
			else:
				self.client.disconnect()

		tornado.ioloop.IOLoop.instance().add_timeout(
			datetime.timedelta(0.00001),
			check
		)


application = tornado.web.Application([
	(r'/(?P<thread_id>\d+)/', MessagesHandler),
])