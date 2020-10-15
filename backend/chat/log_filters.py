import random
import string
from logging import Filter

__author__ = 'andrew'


def id_generator(size=16, chars=string.ascii_letters + string.digits):
	return ''.join(random.choice(chars) for _ in range(size))


class ContextFilter(Filter):

	def filter(self, record):
		if not hasattr(record, 'user_id'):
			record.user_id = None
		if not hasattr(record, 'id'):
			record.id = None
		if not hasattr(record, 'ip'):
			record.ip = None
		return True
