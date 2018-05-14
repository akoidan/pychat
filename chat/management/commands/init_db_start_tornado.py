from chat import settings

__author__ = 'andrew'
from django.core.management import call_command, BaseCommand


class Command(BaseCommand):
	help = 'Creates the database and starts tornado service'

	def handle(self, *args, **options):
		call_command('init_db')
		call_command('sync_db')
		call_command('start_tornado', '--port', str(options['port']), '--host', options['host'])

	def add_arguments(self, parser):
		parser.add_argument(
			'--port',
			dest='port',
			default=settings.API_PORT,
			type=int,
		)
		parser.add_argument(
			'--host',
			dest='host',
			default='localhost',
			type=str,
		)
