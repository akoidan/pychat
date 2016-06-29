from chat.models import Room
from chat.settings import ALL_ROOM_ID, ALL_REDIS_ROOM

__author__ = 'andrew'
from django.core.management import call_command, BaseCommand


class Command(BaseCommand):
	help = 'Creates the database'

	def handle(self, *args, **options):
		#Django 1.6 South
		#python manage.py schemamigration story $1 --initial
		#python manage.py syncdb --all
		#python manage.py migrate --fake
		call_command('migrate')
		call_command('makemigrations', 'chat')
		call_command('migrate', 'chat')
		Room(id=ALL_ROOM_ID, name=ALL_REDIS_ROOM).save()
		# call_command('syncdb')