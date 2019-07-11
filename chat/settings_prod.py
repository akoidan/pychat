import sys

from chat.settings_base import *
import logging.config

TEMPLATE_DEBUG = False
DEBUG = False
MAIN_TORNADO_PROCESS_PORT = 8882

TEMPLATES[0]['OPTIONS']['loaders'] = [(
	'django.template.loaders.cached.Loader',
	[
		'django.template.loaders.filesystem.Loader',
		'django.template.loaders.app_directories.Loader',
	]
)]

try:
	logfile_name = 'tornado-{}.log'.format(sys.argv[sys.argv.index('--port') + 1])
except (ValueError, IndexError):
	logfile_name = 'tornado.log'


LOGGING['handlers'] = {
	'default': {
		'level': 'DEBUG',
		'class': 'logging.handlers.TimedRotatingFileHandler',
		'formatter': 'django',
		'when': 'midnight',
		'filters': ['id', ],
		'interval': 1,
		'filename': os.path.join(BASE_DIR, 'log', logfile_name)
	},
	'mail_admins': {
		'level': 'ERROR',
		'class': 'django.utils.log.AdminEmailHandler',
	}
}


LOGGING['loggers'] = {
	'': {
		'handlers': ['default', 'mail_admins'],
		'level': 'DEBUG',
		'propagate': False,
	},
}

logging.config.dictConfig(LOGGING)
