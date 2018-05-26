import logging.config

from chat.settings_base import *

TEMPLATE_DEBUG = False
DEBUG = False


DATABASES = {
	'default': {
		'ENGINE': 'django.db.backends.mysql',  # django.db.backends.sqlite3
		'NAME': 'pychat',
		'USER': 'pychat',
		'PASSWORD': 'pypass',
		'HOST': 'localhost',
		'default-character-set': 'utf8',
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

API_ADDRESS_PATTERN = 'wss://%s/ws?id='