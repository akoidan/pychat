import json

import logging

import redis
import tornadoredis

from chat.models import get_milliseconds
from chat.settings import ALL_REDIS_ROOM, REDIS_PORT, REDIS_HOST, REDIS_DB
from chat.settings_base import ALL_ROOM_ID
from chat.tornado.constants import RedisPrefix
from chat.tornado.message_creator import MessagesCreator
from functools import partial
from tornado import stack_context

logger = logging.getLogger(__name__)


def new_read(instance, *args, **kwargs):
	try:
		return instance.old_read(*args, **kwargs)
	except Exception as e:
		redis_online = sync_redis.hgetall(ALL_REDIS_ROOM)
		logger.warning("Error occurred during reading tornadoredis connection. Redis online  %s", redis_online)
		raise e


def new_readline(self, callback=None):
	try:
		if not self._stream:
			self.disconnect()
			raise ConnectionError('Tried to read from '
								  'non-existent connection')
		if self._stream._read_callback is None:
			callback = stack_context.wrap(callback)
			self.read_callbacks.add(callback)
			callback = partial(self.read_callback, callback)
			self._stream.read_until(b'\r\n', callback=callback)
	except IOError:
		self.fire_event('on_disconnect')

def patch_read(tornado_redis):
	fabric_read = type(tornado_redis.connection.read)
	tornado_redis.connection.old_read = tornado_redis.connection.read
	tornado_redis.connection.read = fabric_read(new_read, tornado_redis.connection)

	# If readline is NOT patched then when redis is running in kubernetes, idk why,
	# spamming from frontend with messages like this from chrome devtool

	# function sendMessage(n) {
	#     ws.sendPrintMessage(`as12d ${n}`, 1, [], -n, 0, null, {}, [])
	#    if (n < 100) {
	#     setTimeout(sendMessage, 1, n+1)
	#    }
	# }
	# sendMessage(1)

	# Will result

	#   File "/home/andrew/.pyenv/versions/pychat/lib/python3.8/site-packages/tornado/web.py", line 1468, in _stack_context_handle_exception
	#     raise_exc_info((type, value, traceback))
	#   File "<string>", line 4, in raise_exc_info
	#   File "/home/andrew/.pyenv/versions/pychat/lib/python3.8/site-packages/tornado/stack_context.py", line 316, in wrapped
	#     ret = fn(*args, **kwargs)
	#   File "/home/andrew/.pyenv/versions/pychat/lib/python3.8/site-packages/tornado/gen.py", line 200, in final_callback
	#     if future.result() is not None:
	#   File "/home/andrew/.pyenv/versions/pychat/lib/python3.8/site-packages/tornado/concurrent.py", line 238, in result
	#     raise_exc_info(self._exc_info)
	#   File "<string>", line 4, in raise_exc_info
	#   File "/home/andrew/.pyenv/versions/pychat/lib/python3.8/site-packages/tornado/gen.py", line 1063, in run
	#     yielded = self.gen.throw(*exc_info)
	#   File "/home/andrew/.pyenv/versions/pychat/lib/python3.8/site-packages/tornadoredis/client.py", line 436, in execute_command
	#     data = yield gen.Task(self.connection.readline)
	#   File "/home/andrew/.pyenv/versions/pychat/lib/python3.8/site-packages/tornado/gen.py", line 1055, in run
	#     value = future.result()
	#   File "/home/andrew/.pyenv/versions/pychat/lib/python3.8/site-packages/tornado/concurrent.py", line 238, in result
	#     raise_exc_info(self._exc_info)
	#   File "<string>", line 4, in raise_exc_info
	#   File "/home/andrew/.pyenv/versions/pychat/lib/python3.8/site-packages/tornado/gen.py", line 622, in Task
	#     func(*args, callback=_argument_adapter(set_result), **kwargs)
	#   File "/home/andrew/.pyenv/versions/pychat/lib/python3.8/site-packages/tornadoredis/connection.py", line 159, in readline
	#     self._stream.read_until(CRLF, callback=callback)
	#   File "/home/andrew/.pyenv/versions/pychat/lib/python3.8/site-packages/tornado/iostream.py", line 285, in read_until
	#     future = self._set_read_callback(callback)
	#   File "/home/andrew/.pyenv/versions/pychat/lib/python3.8/site-packages/tornado/iostream.py", line 669, in _set_read_callback
	#     assert self._read_callback is None, "Already reading"
	# AssertionError: Already reading


	# steps to reproduce bugs:
	# docker run -tp 6379:6379 redis:7.0.0-alpine3.15 - works ok
	# kubectl port-forward redis-deployment-86744b85bf-m74md 6379:6379
	# on minikube, minimal requirement is redis.yaml pod + service on kube, nothing else is needed

	fabric_readline = type(tornado_redis.connection.readline)
	tornado_redis.connection.readline = fabric_readline(new_readline, tornado_redis.connection)


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


def encode_message(message, parsable):
	"""
	@param parsable: Marks message with prefix to specify that
	it should be decoded and proccesed before sending to client
	@param message: message to mark
	@return: marked message
	"""
	jsoned_mess = json.dumps(message)
	if parsable:
		jsoned_mess = RedisPrefix.PARSABLE_PREFIX + jsoned_mess
	return jsoned_mess


def remove_parsable_prefix(message):
	if message.startswith(RedisPrefix.PARSABLE_PREFIX):
		return message[1:]


def ping_online():
	message = encode_message(MessagesCreator.ping_client(get_milliseconds()), True)
	logger.info("Pinging clients: %s", message)
	async_redis_publisher.publish(ALL_ROOM_ID, message)


# # global connection to read synchronously
sync_redis = redis.StrictRedis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB)
patch_hget(sync_redis)
patch_hgetall(sync_redis)
patch_smembers(sync_redis)
# patch(sync_redis)
# Redis connection cannot be shared between publishers and subscribers.
async_redis_publisher = tornadoredis.Client(host=REDIS_HOST, port=REDIS_PORT, selected_db=REDIS_DB)
patch_read(async_redis_publisher)