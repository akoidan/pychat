import logging

import redis
import tornadoredis

from chat.settings import ALL_REDIS_ROOM, TORNADO_REDIS_PORT

logger = logging.getLogger(__name__)


def new_read(instance, *args, **kwargs):
	try:
		return instance.old_read(*args, **kwargs)
	except Exception as e:
		redis_online = sync_redis.hgetall(ALL_REDIS_ROOM)
		logger.error("Error occurred during reading tornadoredis connection. Redis online  %s", redis_online)
		raise e


def patch_read(tornado_redis):
	fabric = type(tornado_redis.connection.read)
	tornado_redis.connection.old_read = tornado_redis.connection.read
	tornado_redis.connection.read = fabric(new_read, tornado_redis.connection)


def new_hget(instance, *args, **kwargs):
	res = instance.hget(*args, **kwargs)
	return res.decode('utf-8') if res else None


def patch_hget(arg_red):
	fabric = type(arg_red.hget)
	arg_red.shget = fabric(new_hget, arg_red)


def patch_hgetall(arg_red):
	fabric = type(arg_red.hgetall)
	arg_red.shgetall = fabric(new_hgetall, arg_red)


def new_hgetall(instance, *args, **kwargs):
	res = instance.hgetall(*args, **kwargs) # neither key or value are null
	return {k.decode('utf-8'): res[k].decode('utf-8') for k in res}


def patch_smembers(arg_red):
	fabric = type(arg_red.smembers)
	arg_red.ssmembers = fabric(new_smembers, arg_red)


def new_smembers(instance, *args, **kwargs):
	res = instance.smembers(*args, **kwargs) # neither key or value are null
	return [k.decode('utf-8') for k in res]


# # global connection to read synchronously
sync_redis = redis.StrictRedis(port=TORNADO_REDIS_PORT)
patch_hget(sync_redis)
patch_hgetall(sync_redis)
patch_smembers(sync_redis)
# patch(sync_redis)
# Redis connection cannot be shared between publishers and subscribers.
async_redis_publisher = tornadoredis.Client(port=TORNADO_REDIS_PORT)
patch_read(async_redis_publisher)
async_redis_publisher.connect()