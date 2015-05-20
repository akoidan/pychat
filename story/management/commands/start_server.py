import signal
import time

import tornado.httpserver
import tornado.ioloop

from django.core.management.base import BaseCommand
from Chat.tornadoapp import application
from django.conf import settings


class Command(BaseCommand):
	help = 'Starts the Tornado application for message handling.'

	def sig_handler(self, sig, frame):
		"""Catch signal and init callback"""
		tornado.ioloop.IOLoop.instance().add_callback(self.shutdown)

	def shutdown(self):
		"""Stop server and add callback to stop i/o loop"""
		self.http_server.stop()

		io_loop = tornado.ioloop.IOLoop.instance()
		io_loop.add_timeout(time.time() + 2, io_loop.stop)

	def handle(self, *args, **options):
		self.http_server = tornado.httpserver.HTTPServer(application)
		self.http_server.listen(settings.API_PORT)

		# Init signals handler
		signal.signal(signal.SIGTERM, self.sig_handler)

		# This will also catch KeyboardInterrupt exception
		signal.signal(signal.SIGINT, self.sig_handler)

		tornado.ioloop.IOLoop.instance().start()