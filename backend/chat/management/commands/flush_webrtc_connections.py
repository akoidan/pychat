from django.core.management.base import BaseCommand

from chat.tornado.constants import RedisPrefix


class Command(BaseCommand):

	def __init__(self):
		super(Command, self).__init__()
	help = 'Removes all information about current webrtc connections status from redis'

	def handle(self, *args, **options):
		from chat.global_redis import sync_redis
		webrtc_connections = sync_redis.hgetall(RedisPrefix.WEBRTC_CONNECTION)
		if webrtc_connections:
			sync_redis.delete(*webrtc_connections.keys())
			sync_redis.delete(RedisPrefix.WEBRTC_CONNECTION)
			print('Flushed webrtc connections: {}'.format(webrtc_connections))
		else:
			print("There're no connections to flush in '{}' redis key, skipping...".format(RedisPrefix.WEBRTC_CONNECTION))
