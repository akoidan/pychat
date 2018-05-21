import hashlib
import threading
from os import path, name, stat
from stat import S_ISDIR,ST_MODE
from django import template

from chat.settings import STATIC_URL, STATIC_ROOT, logging, DEBUG

register = template.Library()
logger = logging.getLogger(__name__)

md5_cache = {}


@register.simple_tag
def md5url(file_name):
	value = md5_cache.get(file_name)
	if value is None or DEBUG:
		value = calculate_url(file_name)
	return value


def calculate_url(file_name):
	entry_name = file_name
	file_path = None
	try:
		key = '#root#'
		if key in file_name:
			file_name = file_name.split(key, 1)[1]
			file_path = path.join(STATIC_ROOT, entry_name.replace(key, ''))
			prefix = ''
		else:
			file_path = path.join(STATIC_ROOT, file_name)
			prefix = STATIC_URL

		md5 = calculate_file_md5(path.join(STATIC_ROOT, file_path))[:8]
		value = '%s%s?v=%s' % (prefix, file_name, md5)
		logger.info("Caching url '%s' for file '%s'", value, file_name)
	except Exception as e:
		mode = stat(file_path)[ST_MODE]
		if file_path and S_ISDIR(mode):
			value = STATIC_URL + file_name
			logger.warning("Caching url '%s' for directory %s", value, file_name)
		else:
			raise Exception('Unable to calculate md5 for {} because {}', file_name, e)
	md5_cache[entry_name] = value
	return value


def calculate_file_md5(file_path):
	with open(file_path, 'rb') as fh:
		m = hashlib.md5()
		while True:
			data = fh.read(8192)
			if not data:
				break
			m.update(data)
		return m.hexdigest()
