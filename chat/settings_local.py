from chat.settings_base import *
import sslserver
import logging.config
from corsheaders.defaults import default_headers

DEBUG = True
TEMPLATE_DEBUG = True
SECRET_KEY = '8ou!cqb1yd)6c4h0i-cxjo&@@+04%4np6od8qn+z@5b=6)!v(o'
class InvalidString(str):
	def __mod__(self, other):
		from django.template.base import TemplateSyntaxError
		raise TemplateSyntaxError(
			"Undefined variable or unknown value for: %s" % other)

API_ADDRESS_PATTERN = ''.join((WEBSOCKET_PROTOCOL, '://%s:', API_PORT, '/?id='))

TEMPLATE_STRING_IF_INVALID = InvalidString("%s")
TEMPLATES[0]['OPTIONS']['loaders'] = [
	'django.template.loaders.filesystem.Loader',
	'django.template.loaders.app_directories.Loader',
]
CRT_PATH = os.sep.join((sslserver.__path__[0], "certs", "development.crt"))
KEY_PATH = os.sep.join((sslserver.__path__[0], "certs", "development.key"))
TORNADO_SSL_OPTIONS = {
	"certfile": CRT_PATH,
	"keyfile": KEY_PATH
}
INSTALLED_APPS = INSTALLED_APPS + ('sslserver',)
LOGGING['handlers'] = console_handlers
LOGGING['loggers'] = {
	'': {
		'handlers': ['default', ],
		'level': 'DEBUG',
		'propagate': False,
	},
}

MIDDLEWARE_CLASSES = ('corsheaders.middleware.CorsMiddleware', ) + MIDDLEWARE_CLASSES
CORS_ORIGIN_WHITELIST = (
	'localhost:8080'
)

CORS_ALLOW_HEADERS = default_headers + (
    'session-id',
)

# Don't close socket if we're in debug
PING_CLOSE_JS_DELAY = 100000

logging.config.dictConfig(LOGGING)



