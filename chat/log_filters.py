import random
import string
from logging import Filter

from chat import local

__author__ = 'andrew'


def id_generator(size=16, chars=string.ascii_letters + string.digits):
	return ''.join(random.choice(chars) for _ in range(size))


class ContextFilter(Filter):

	def filter(self, record):
		record.username = getattr(local, 'user', None)
		record.id = getattr(local, 'random', None)
		record.ip = getattr(local, 'client_ip', None)
		return True