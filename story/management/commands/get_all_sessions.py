__author__ = 'andrew'
from django.core.management import BaseCommand
from django.db import models
import base64
import json
import redis

class Command(BaseCommand):

	help = 'Print every session fetched from redis backend'

	def get_values_from_redis(self):
		sync_redis = redis.StrictRedis()
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
			print(value[1])
