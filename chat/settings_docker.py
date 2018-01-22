from chat.settings_base import *
import logging.config

TEMPLATE_DEBUG = True
DEBUG = True

REDIS_HOST = 'redis'
SESSION_REDIS = {
	'host': REDIS_HOST,
	'post': REDIS_PORT,
	'db': 3
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
LOGGING['loggers'] = {
	'django.request': {
		'handlers': ['mail_admins', 'django-console'],
		'level': 'ERROR',
		'propagate': False,
	},
	'': {
		'handlers': ['django-console', ],
		'level': 'DEBUG',
		'propagate': False,
	},
	'tornado.application': {
		'handlers': ['django-console', 'mail_admins'],
		'level': 'ERROR',
		'propagate': True,
	},
	'chat.tornado': {
		'handlers': ['django-console'],
		'level': 'DEBUG',
		'propagate': False,
	},

}

logging.config.dictConfig(LOGGING)



API_ADDRESS_PATTERN = 'wss://%s:8000/ws?id='