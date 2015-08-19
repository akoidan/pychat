from story import local
from logging import Filter
import random
import string


__author__ = 'andrew'


def id_generator(size=16, chars=string.ascii_letters + string.digits):
	return ''.join(random.choice(chars) for _ in range(size))


class ContextFilter(Filter):

	def filter(self, record):
		record.username = getattr(local, 'user', None)
		record.id = getattr(local, 'random', None)
		return True