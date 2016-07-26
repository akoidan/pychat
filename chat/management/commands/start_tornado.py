import signal
import time

from django.conf import settings
from django.core.management.base import BaseCommand
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop
from tornado.web import Application

from chat.models import Room
from chat.tornadoapp import TornadoHandler


class Command(BaseCommand):

	def __init__(self):
		super().__init__()
		application = Application([
			(r'.*', TornadoHandler),
		], debug=False)
		try:
			ssl_options={
				"certfile": settings.CRT_PATH,
				"keyfile": settings.KEY_PATH
			}
		except AttributeError:
			ssl_options = None
		self.http_server = HTTPServer(application, ssl_options=ssl_options)
	help = 'Starts the Tornado application for message handling.'

	def sig_handler(self):
		"""Catch signal and init callback"""
		IOLoop.instance().add_callback(self.shutdown)

	def shutdown(self):
		"""Stop server and add callback to stop i/o loop"""
		self.http_server.stop()

		io_loop = IOLoop.instance()
		io_loop.add_timeout(time.time() + 2, io_loop.stop)

	def handle(self, *args, **options):
		self.http_server.bind(settings.API_PORT)

		#  uncomment me for multiple process
		self.http_server.start(1)
		# Init signals handler
		from chat.global_redis import sync_redis
		rooms = Room.objects.values('id')
		for room in rooms:
			sync_redis.delete(room['id'])
		signal.signal(signal.SIGTERM, self.sig_handler)

		# This will also catch KeyboardInterrupt exception
		signal.signal(signal.SIGINT, self.sig_handler)

		IOLoop.instance().start()
