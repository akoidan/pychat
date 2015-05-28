__author__ = 'andrew'
from logging.handlers import RotatingFileHandler


#TODO
class RequestRotatingFileLogger(RotatingFileHandler, object):
	def emit(self, record):
		record.ip = '0.0.0.0'
		try:
			request = record.args[0]
			record.ip = request.META.get('REMOTE_ADDR')
			record.args = None
		except:
			pass

		super(RequestRotatingFileLogger, self).emit(record)