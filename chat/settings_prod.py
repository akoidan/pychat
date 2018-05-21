from chat.settings_base import *
import logging.config

TEMPLATE_DEBUG = False
DEBUG = False
MAIN_TORNADO_PROCESS_PORT = 8882

TEMPLATES[0]['OPTIONS']['loaders'] = [
	('django.template.loaders.cached.Loader', [
		'django.template.loaders.filesystem.Loader',
		'django.template.loaders.app_directories.Loader',
	])]
LOGGING['handlers'] = file_handlers
file_handlers.update(mail_admins)
LOGGING['loggers'] = {
	'': {
		'handlers': ['default', 'mail_admins'],
		'level': 'DEBUG',
		'propagate': False,
	},
}

logging.config.dictConfig(LOGGING)
