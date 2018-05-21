import logging.config

from chat.settings_base import *

TEMPLATE_DEBUG = True
DEBUG = True

REDIS_HOST = 'redis'
SESSION_REDIS = {
	'host': REDIS_HOST,
	'post': REDIS_PORT,
	'db': 0
}
DATABASES = {
	'default': {
		'ENGINE': 'django.db.backends.mysql',
		'NAME': 'pychat',
		'USER': 'pychat',
		'PASSWORD': 'pypass',
		'HOST': 'db',
		'PORT': '3306',  # mysql uses socket if host is localhost
		'OPTIONS': {
			'autocommit': True,
		},
	}
}
TEMPLATES[0]['OPTIONS']['loaders'] = [
	('django.template.loaders.cached.Loader', [
		'django.template.loaders.filesystem.Loader',
		'django.template.loaders.app_directories.Loader',
	])]
LOGGING['handlers'] = console_handlers
console_handlers.update(mail_admins)
LOGGING['loggers'] = {
	'': {
		'handlers': ['default', 'mail_admins'],
		'level': 'DEBUG',
		'propagate': False,
	},
}

logging.config.dictConfig(LOGGING)

TORNADO_SSL_OPTIONS = {
	"certfile": '/etc/nginx/ssl/certificate.crt',
	"keyfile": '/etc/nginx/ssl/server.key'
}
API_ADDRESS_PATTERN = 'wss://%s:8888/?id='