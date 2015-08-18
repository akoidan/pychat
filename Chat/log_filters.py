from logging import Filter
import random
import string

__author__ = 'andrew'


def id_generator(size=16, chars=string.ascii_letters + string.digits):
	return ''.join(random.choice(chars) for _ in range(size))


class ContextFilter(Filter):

	def __init__(self):
		super().__init__()
		self.id = id_generator(4)

	def filter(self, record):
		record.id = self.id
		return True