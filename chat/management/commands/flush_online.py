from django.core.management.base import BaseCommand

from chat.models import Room


class Command(BaseCommand):

	def __init__(self):
		super(Command, self).__init__()
	help = 'Removes information about current online from redis'

	def handle(self, *args, **options):
		from chat.global_redis import sync_redis
		rooms = Room.objects.values('id')
		rooms_id = [room['id'] for room in rooms]
		sync_redis.delete(*rooms_id)
		print('Flushed room keys: {}'.format(rooms_id))