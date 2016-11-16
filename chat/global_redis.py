import logging

import redis
import tornadoredis

from chat.settings import ALL_REDIS_ROOM

logger = logging.getLogger(__name__)


def new_read(instance, *args, **kwargs):
	try:
		return instance.old_read(*args, **kwargs)
	except Exception as e:
		redis_online = sync_redis.hgetall(ALL_REDIS_ROOM)
		logger.error("Error occurred during reading tornadoredis connection. Redis online  %s", redis_online)
		raise e


def patch(tornado_redis):
	fabric = type(tornado_redis.connection.read)
	tornado_redis.connection.old_read = tornado_redis.connection.read
	tornado_redis.connection.read = fabric(new_read, tornado_redis.connection)


# # global connection to read synchronously
sync_redis = redis.StrictRedis()
# patch(sync_redis)
# Redis connection cannot be shared between publishers and subscribers.
async_redis_publisher = tornadoredis.Client()
patch(async_redis_publisher)
async_redis_publisher.connect()