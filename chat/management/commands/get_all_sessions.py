from django.conf import settings

__author__ = 'andrew'
import base64
import json

import redis
from django.core.management import BaseCommand

class Command(BaseCommand):

	help = 'Print every session fetched from redis backend'

	def get_values_from_redis(self):
		v = settings.SESSION_REDIS
		sync_redis = redis.StrictRedis(v.get('host'), v.get('port'), v.get('db'))
		keys = sync_redis.keys()
		for key in keys:
			try:
				raw = sync_redis.get(key)
				value =base64.standard_b64decode(raw).decode('utf-8')
				index = value.index(':')
				session = value[:index]
				kv = value[index+1:]
				res = json.loads(kv)
				if res:
					yield key.decode('utf-8'), session, res
			except:
				pass

	def handle(self, *args, **options):
		values = self.get_values_from_redis()
		for value in values:
			print(value[0])
