import time

import signal
from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop, PeriodicCallback
from tornado.web import Application, StaticFileHandler
from chat.global_redis import ping_online
from chat.tornado.http_handler import HttpHandler
import logging

from chat.tornado.static_file_handler import PychatStaticFileHandler

TORNADO_SSL_OPTIONS = getattr(settings, "TORNADO_SSL_OPTIONS", None)
from chat.tornado.tornado_handler import TornadoHandler


logger = logging.getLogger(__name__)


class Command(BaseCommand):

	help = 'Starts the Tornado application for message handling.'

	def add_arguments(self, parser):
		parser.add_argument(
			'--port',
			dest='port',
			default=8888,
			type=int,
		)
		parser.add_argument(
			'--host',
			dest='host',
			default='0.0.0.0',
			type=str,
		)
		parser.add_argument(
			'--keep_online',
			action='store_true',
			dest='keep_online',
			default=False,
			help='Execute flush command as well',
		)

	def sig_handler(self, a, b):
		"""Catch signal and init callback"""
		IOLoop.instance().add_callback(self.shutdown)

	def shutdown(self):
		"""Stop server and add callback to stop i/o loop"""
		self.http_server.stop()
		io_loop = IOLoop.instance()
		io_loop.add_timeout(time.time() + 2, io_loop.stop)

	def handle(self, *args, **options):
		application = Application([
			(r'/api/.*', HttpHandler),
			(r'/photo/(.*)', PychatStaticFileHandler, {'path': settings.MEDIA_ROOT}),
			(r'/ws', TornadoHandler),
		], debug=settings.DEBUG, default_host=options['host'])
		self.http_server = HTTPServer(application, ssl_options=TORNADO_SSL_OPTIONS, max_buffer_size=1000000000) # 1GB, limit in nginx if u need
		self.http_server.bind(options['port'], options['host'])
		print('tornado server started at {}:{}'.format(options['host'], options['port']))
		#  uncomment me for multiple process
		self.http_server.start(1)
		# Init signals handler
		if not options['keep_online']:
			call_command('flush_online')
		if not hasattr(settings, 'MAIN_TORNADO_PROCESS_PORT') \
				or settings.MAIN_TORNADO_PROCESS_PORT == options['port']:
			logger.info("Starting pinger")
			PeriodicCallback(ping_online, settings.PING_INTERVAL).start()
		else:
			logger.info("Skipping pinger for this instance")
		signal.signal(signal.SIGTERM, self.sig_handler)
		# This will also catch KeyboardInterrupt exception
		IOLoop.instance().start()
