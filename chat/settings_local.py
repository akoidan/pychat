from chat.settings_base import *
import sslserver
import logging.config

SESSION_REDIS = {
	'host': REDIS_HOST,
	'post': REDIS_PORT,
	'db': 3
}

DEBUG = True
TEMPLATE_DEBUG = True
SECRET_KEY = '8ou!cqb1yd)6c4h0i-cxjo&@@+04%4np6od8qn+z@5b=6)!v(o'
class InvalidString(str):
	def __mod__(self, other):
		from django.template.base import TemplateSyntaxError
		raise TemplateSyntaxError(
			"Undefined variable or unknown value for: %s" % other)

TEMPLATE_STRING_IF_INVALID = InvalidString("%s")

CRT_PATH = os.sep.join((sslserver.__path__[0], "certs", "development.crt"))
KEY_PATH = os.sep.join((sslserver.__path__[0], "certs", "development.key"))
TORNADO_SSL_OPTIONS = {
	"certfile": CRT_PATH,
	"keyfile": KEY_PATH
}
INSTALLED_APPS = INSTALLED_APPS + ('sslserver',)
LOGGING['handlers'] = console_handlers
LOGGING['loggers'] = {
	# root logger
	'': {
		'handlers': ['django-console'],
		'level': 'DEBUG',
		'propagate': False,
	},
	'chat.tornado': {
		'handlers': ['tornado-console'],
		'level': 'DEBUG',
		'propagate': False,
	},
}


logging.config.dictConfig(LOGGING)



