from chat.settings_base import *
import logging.config

DEBUG = True
TEMPLATE_DEBUG = True
SECRET_KEY = '8ou!cqb1yd)6c4h0i-cxjo&@@+04%4np6od8qn+z@5b=6)!v(o'
class InvalidString(str):
	def __mod__(self, other):
		from django.template.base import TemplateSyntaxError
		raise TemplateSyntaxError(
			"Undefined variable or unknown value for: %s" % other)

TEMPLATE_STRING_IF_INVALID = InvalidString("%s")
TEMPLATES[0]['OPTIONS']['loaders'] = [
	'django.template.loaders.filesystem.Loader',
	'django.template.loaders.app_directories.Loader',
]

CRT_PATH = os.sep.join((PROJECT_DIR, os.pardir, "fe", "certs", "server.crt"))
KEY_PATH = os.sep.join((PROJECT_DIR, os.pardir, "fe", "certs", "key.pem"))
TORNADO_SSL_OPTIONS = {
	"certfile": CRT_PATH,
	"keyfile": KEY_PATH
}

# Prevent host header attacks in emails
SERVER_ADDRESS = 'https://localhost:8080'

LOGGING['handlers'] = {
	'default': {
		'level': 'DEBUG',
		'class': 'logging.StreamHandler',
		'filters': ['id', ],
		'formatter': 'django',
	},
}

LOGGING['loggers'] = {
	'': {
		'handlers': ['default', ],
		'level': 'DEBUG',
		'propagate': False,
	},
}

# Don't close socket if we're in debug
PING_CLOSE_JS_DELAY = 100000

logging.config.dictConfig(LOGGING)



