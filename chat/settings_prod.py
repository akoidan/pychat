from chat.settings_base import *
import logging.config

TEMPLATE_DEBUG = False
DEBUG = False

TEMPLATES[0]['OPTIONS']['loaders'] = [
	('django.template.loaders.cached.Loader', [
		'django.template.loaders.filesystem.Loader',
		'django.template.loaders.app_directories.Loader',
	])]
LOGGING['loggers'] = {
	'django.request': {
		'handlers': ['mail_admins', 'file'],
		'level': 'ERROR',
		'propagate': False,
	},
	'': {
		'handlers': ['file', ],
		'level': 'DEBUG',
		'propagate': False,
	},
	'tornado.application': {
		'handlers': ['file-tornado', 'mail_admins'],
		'level': 'ERROR',
		'propagate': True,
	},
	'chat.tornado': {
		'handlers': ['file-tornado'],
		'level': 'DEBUG',
		'propagate': False,
	},

}

logging.config.dictConfig(LOGGING)
