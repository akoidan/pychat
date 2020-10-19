from chat.models import Room
from chat.settings import ALL_ROOM_ID, ALL_REDIS_ROOM

__author__ = 'andrew'
from django.core.management import BaseCommand


class Command(BaseCommand):
	help = 'Creates initial data in database'

	def handle(self, *args, **options):
		Room.objects.get_or_create(id=ALL_ROOM_ID, name=ALL_REDIS_ROOM)
