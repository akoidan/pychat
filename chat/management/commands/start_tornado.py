import signal
import time

from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop
from tornado.web import Application

from django.conf import settings

from chat.tornado.http_handler import HttpHandler

TORNADO_SSL_OPTIONS = getattr(settings, "TORNADO_SSL_OPTIONS", None)
from chat.tornado.tornado_handler import TornadoHandler


class Command(BaseCommand):

	def __init__(self):
		super(Command, self).__init__()
		application = Application([
			(r'/test', HttpHandler),
			(r'.*', TornadoHandler),
		], debug=settings.DEBUG)
		self.http_server = HTTPServer(application, ssl_options=TORNADO_SSL_OPTIONS)
	help = 'Starts the Tornado application for message handling.'

	def add_arguments(self, parser):
		parser.add_argument(
			'--port',
			dest='port',
			default=settings.API_PORT,
			type=int,
		)
		parser.add_argument(
			'--keep_online',
			action='store_true',
			dest='keep_online',
			default=False,
			help='Execute flush command as well',
		)

	def sig_handler(self):
		"""Catch signal and init callback"""
		IOLoop.instance().add_callback(self.shutdown)

	def shutdown(self):
		"""Stop server and add callback to stop i/o loop"""
		self.http_server.stop()
		io_loop = IOLoop.instance()
		io_loop.add_timeout(time.time() + 2, io_loop.stop)

	def handle(self, *args, **options):
		self.http_server.bind(options['port'])
		print('Listening port {}'.format(options['port']))
		#  uncomment me for multiple process
		self.http_server.start(1)
		# Init signals handler
		if not options['keep_online']:
			call_command('flush_online')
		signal.signal(signal.SIGTERM, self.sig_handler)
		# This will also catch KeyboardInterrupt exception
		signal.signal(signal.SIGINT, self.sig_handler)
		IOLoop.instance().start()
