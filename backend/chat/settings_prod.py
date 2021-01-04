import logging.config
import sys

from chat.settings_base import *

TEMPLATE_DEBUG = False
DEBUG = False
MAIN_TORNADO_PROCESS_PORT = 8888

TEMPLATES[0]['OPTIONS']['loaders'] = [(
	'django.template.loaders.cached.Loader',
	[
		'django.template.loaders.filesystem.Loader',
		'django.template.loaders.app_directories.Loader',
	]
)]


LOGGING['handlers'] = {
	'default': {
		'level': 'DEBUG',
		'class': 'logging.StreamHandler',
		'stream': sys.stdout,
		'filters': ['id', ],
		'formatter': 'django',
	},
	'mail_admins': {
		'level': 'ERROR',
		'class': 'django.utils.log.AdminEmailHandler',
	}
}

LOGGING['loggers'] = {
	'': {
		'handlers': ['default', ],
		'level': 'DEBUG',
		'propagate': False,
	},
}

logging.config.dictConfig(LOGGING)
