__author__ = 'andrew'
from django.core.management import call_command, BaseCommand


class Command(BaseCommand):
	help = 'Inits the database'

	def handle(self, *args, **options):
		#Django 1.6 South
		#python manage.py schemamigration story $1 --initial
		#python manage.py syncdb --all
		#python manage.py migrate --fake
		call_command('makemigrations', 'chat')
		call_command('migrate', 'chat')
		call_command('syncdb')