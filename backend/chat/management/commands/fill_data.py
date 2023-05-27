from chat.models import Room, Channel, User
from chat.settings import ALL_ROOM_ID, ALL_REDIS_ROOM

__author__ = 'andrew'
from django.core.management import BaseCommand


class Command(BaseCommand):
	help = 'Creates initial data in database'

	def handle(self, *args, **options):
		channel_exists = Channel.objects.filter(
			id=ALL_ROOM_ID
		).count()
		if channel_exists == 0:
			channel = Channel.objects.create(
				name=ALL_REDIS_ROOM,
				id=ALL_ROOM_ID,
				creator=None
			)
			Room.objects.get_or_create(
				id=ALL_ROOM_ID,
				is_main_in_channel=True,
				channel_id=channel.id,
				creator=None,
				name=ALL_REDIS_ROOM
			)
