import datetime
import json
import time
import urllib

import tornado.web
import tornado.websocket
import tornado.ioloop
import tornado.httpclient

from django.conf import settings
from django.utils.importlib import import_module
import tornadoredis

session_engine = import_module(settings.SESSION_ENGINE)

from django.contrib.auth.models import User


c = tornadoredis.Client()
c.connect()


class MainHandler(tornado.web.RequestHandler):
	def get(self):
		self.set_header('Content-Type', 'text/plain')
		self.write('Hello. :)')


class MessagesHandler(tornado.websocket.WebSocketHandler):
	def __init__(self, *args, **kwargs):
		super(MessagesHandler, self).__init__(*args, **kwargs)
		self.client = tornadoredis.Client()
		self.client.connect()

	def open(self, thread_id):
		session_key = self.get_cookie(settings.SESSION_COOKIE_NAME)
		session = session_engine.SessionStore(session_key)
		try:
			self.user_id = session["_auth_user_id"]
			self.sender_name = User.objects.get(id=self.user_id).username
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

	def on_message(self, message):
		if not message:
			return
		if len(message) > 10000:
			return
		c.publish(self.channel, json.dumps({
			"timestamp": int(time.time()),
			"sender": self.sender_name,
			"text": message,
		}))
		http_client = tornado.httpclient.AsyncHTTPClient()
		request = tornado.httpclient.HTTPRequest(
			"".join([
				settings.SEND_MESSAGE_API_URL,
				"/",
				self.thread_id,
				"/"
			]),
			method="POST",
			body=urllib.urlencode({
				"message": message.encode("utf-8"),
				"api_key": settings.API_KEY,
				"sender_id": self.user_id,
			})
		)
		http_client.fetch(request, self.handle_request)

	def show_new_message(self, result):
		self.write_message(str(result.body))

	def on_close(self):
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
	(r"/", MainHandler),
	(r'/(?P<thread_id>\d+)/', MessagesHandler),
])