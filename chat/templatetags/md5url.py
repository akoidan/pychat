import hashlib
import threading
from os import path

from django import template

from chat.settings import STATIC_URL, STATIC_ROOT, logging, DEBUG

register = template.Library()
logger = logging.getLogger(__name__)


class UrlCache(object):
	_md5_sum = {}
	_lock = threading.Lock()

	@classmethod
	def get_md5(cls, file_name):
		try:
			if DEBUG:
				raise KeyError("Debug mode is on, forcing calculating")
			else:
				return cls._md5_sum[file_name]
		except KeyError:
			entry_name = file_name
			with cls._lock:
				try:
					key = '#root#'
					if key in file_name:
						file_name = file_name.split(key,1)[1]
						file_path = path.join(STATIC_ROOT, entry_name.replace(key, ''))
						prefix = ''
					else:
						file_path = path.join(STATIC_ROOT, file_name)
						prefix = STATIC_URL

					md5 = cls.calc_md5(path.join(STATIC_ROOT, file_path))[:8]
					value = '%s%s?v=%s' % (prefix, file_name, md5)
					logger.info("Static file %s calculated md5 %s", file_name, md5)
				except:
					value = STATIC_URL + file_name
					logger.error("File %s not found, put url %s", file_name, value)
				cls._md5_sum[entry_name] = value
				return value

	@classmethod
	def calc_md5(cls, file_path):
		with open(file_path, 'rb') as fh:
			m = hashlib.md5()
			while True:
				data = fh.read(8192)
				if not data:
					break
				m.update(data)
			return m.hexdigest()


@register.simple_tag
def md5url(file_name):
	return UrlCache.get_md5(file_name)
