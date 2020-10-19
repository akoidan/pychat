from django.core.management.base import BaseCommand

from chat.models import Room
from chat.tornado.constants import RedisPrefix


class Command(BaseCommand):

	def __init__(self):
		super(Command, self).__init__()
	help = 'Removes information about current online from redis'

	def handle(self, *args, **options):
		from chat.global_redis import sync_redis
		sync_redis.delete(RedisPrefix.ONLINE_VAR)