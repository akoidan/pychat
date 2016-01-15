import redis
import tornadoredis

# global connection to read synchronously
sync_redis = redis.StrictRedis()
# Redis connection cannot be shared between publishers and subscribers.
async_redis_publisher = tornadoredis.Client()
async_redis_publisher.connect()