"""
Django settings for myproject project.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.6/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import logging.config
import os
import sys
from os.path import join

from django.conf import global_settings
import sslserver

import chat as project_module

try:
	from chat.production import *
	print('imported production.py settings')
except ImportError as e:
	print('Failed to import production.py because {}'.format(e))
	pass

LOGGING_CONFIG = None

BASE_DIR = os.path.dirname(os.path.dirname(__file__))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.6/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '8ou!cqb1yd)6c4h0i-cxjo&@@+04%4np6od8qn+z@5b=6)!v(o'

# SECURITY WARNING: don't run with debug turned on in production!


DEBUG = True

ALLOWED_HOSTS = ["*",]

username_processor = 'chat.context_processors.add_user_name'

# Application definition

INSTALLED_APPS = (
	'django.contrib.admin',
	'django.contrib.auth',
	'django.contrib.contenttypes',
	'django.contrib.sessions',
	'django.contrib.messages',
	'django.contrib.staticfiles',
	'django.db.migrations',
	'chat',
	'simplejson',
	'redis',
	'tornado',
	"sslserver"
)

# TODO replace this into your keys if you want this features to be available
# Google recaptcha keys
RECAPTHCA_SITE_URL = 'https://www.google.com/recaptcha/api.js'
# RECAPTCHA_SECRET_KEY = 'REPLACE_THIS_WITH_KEY_FOR_RETRIEVING_RESULT'
# RECAPTCHA_SITE_KEY = 'REPLACE_THIS_WITH_DATA-SITEKEY_DIV_ATTRIBUTE'
# GOOGLE_OAUTH_2_CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com'
GOOGLE_OAUTH_2_JS_URL = 'https://apis.google.com/js/platform.js'
FACEBOOK_JS_URL = '//connect.facebook.net/en_US/sdk.js'
#FACEBOOK_ACCESS_TOKEN = '!6_NUMBER_APP_ID|ALPHABET_TOKEN' # https://developers.facebook.com/tools/access_token/
#FACEBOOK_APP_ID = '16_NUMBER_APP_ID' # https://developers.facebook.com/apps/
# GOOGLE_OAUTH_2_HOST = 'pychat.org'

REDIS_PORT = 6379
TORNADO_REDIS_PORT = REDIS_PORT
SESSION_REDIS_PORT = REDIS_PORT
SESSION_ENGINE = 'redis_sessions.session'
BROKER_URL = str(SESSION_REDIS_PORT).join(('redis://localhost:','/0'))
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'

CRT_PATH = os.sep.join((sslserver.__path__[0], "certs", "development.crt"))
KEY_PATH = os.sep.join((sslserver.__path__[0], "certs", "development.key"))

IS_HTTPS = 'CRT_PATH' in locals()
API_PORT = '8888'
EXTENSION_ID = 'cnlplcfdldebgdlcmpkafcialnbopedn'
EXTENSION_INSTALL_URL = 'https://chrome.google.com/webstore/detail/pychat-screensharing-exte/' + EXTENSION_ID
WEBSOCKET_PROTOCOL = 'wss' if IS_HTTPS else 'ws'
SITE_PROTOCOL = 'https' if IS_HTTPS else 'http'
API_ADDRESS_PATTERN = ''.join((WEBSOCKET_PROTOCOL, '://%s:', API_PORT, '/?id='))

# GIPHY_API_KEY = 'thZMTtDfFdugqPDIAY461GzYTctuYIeIj' // TODO paste your GIPHY api key from https://developers.giphy.com/
GIPHY_URL= 'http://api.giphy.com/v1/gifs/random?api_key={}&q={}'
GIPHY_REGEX = r"^\s*\/giphy (.+)"
# SESSION_COOKIE_AGE = 10
# SESSION_SAVE_EVERY_REQUEST = True
# SESSION_EXPIRE_AT_BROWSER_CLOSE = True

MIDDLEWARE_CLASSES = (
	'django.middleware.csrf.CsrfViewMiddleware',
	'django.contrib.sessions.middleware.SessionMiddleware',
	'django.middleware.common.CommonMiddleware',
	'django.contrib.auth.middleware.AuthenticationMiddleware',
	'django.contrib.messages.middleware.MessageMiddleware',
	'chat.cookies_middleware.UserCookieMiddleWare',
	'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'chat.urls'

WSGI_APPLICATION = 'chat.wsgi.application'

AUTH_USER_MODEL = 'chat.User'
AUTHENTICATION_BACKENDS = ['chat.utils.EmailOrUsernameModelBackend']

LOGIN_URL = '/'
FIREBASE_URL = 'https://android.googleapis.com/gcm/send'

# Database
# https://docs.djangoproject.com/en/1.6/ref/settings/#databases
# pip install PyMySQL
# import pymysql
# pymysql.install_as_MySQLdb()
if 'DATABASES' not in locals():
	DATABASES = {
		'default': {
			'NAME': 'django',
			'ENGINE': 'django.db.backends.mysql',  # django.db.backends.sqlite3
			'USER': 'root', # TODO put your username here
			'PASSWORD': '', # TODO put your password here
			'default-character-set': 'utf8',
			'OPTIONS': {
				'autocommit': True,

			},
		}
	}

#
# DATABASES = {
# 	'default': {
# 		'ENGINE': 'django.db.backends.sqlite3',
# 		'NAME': 'django.db',
# 	}
# }

CACHES = {
	'default': {
		'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
	}
}

# Internationalization
# https://docs.djangoproject.com/en/1.6/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Europe/Kiev'

USE_I18N = True

USE_L10N = True

USE_TZ = True

DEFAULT_CHARSET = 'utf-8'

handler404 = 'chat.views.handler404'

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.6/howto/static-files/
STATIC_URL = '/static/'

PROJECT_DIR = os.path.dirname(os.path.realpath(project_module.__file__))

STATIC_ROOT = os.path.join(PROJECT_DIR, 'static')
SMILEYS_ROOT = os.path.join(STATIC_ROOT, 'smileys')

AUTH_PROFILE_MODULE = 'chat.UserProfile'

if 'start_tornado' in sys.argv:
	log_file_name = 'tornado.log'
else:
	log_file_name = 'chat.log'

if DEBUG:
	class InvalidString(str):
		def __mod__(self, other):
			from django.template.base import TemplateSyntaxError
			raise TemplateSyntaxError(
				"Undefined variable or unknown value for: %s" % other)
	TEMPLATE_STRING_IF_INVALID = InvalidString("%s")

TEMPLATES = [{
	'BACKEND': 'django.template.backends.django.DjangoTemplates',
	'DIRS': [join(BASE_DIR, 'templates')],
	'OPTIONS': {
		# 'loaders': [
		# 	('django.template.loaders.cached.Loader', [
		# 		'django.template.loaders.filesystem.Loader',
		# 		'django.template.loaders.app_directories.Loader',
		# 	])],
		'context_processors': global_settings.TEMPLATE_CONTEXT_PROCESSORS + [username_processor]
	}
}]

LOGGING = {
	'version': 1,
	'disable_existing_loggers': True,
	'filters': {
		'id': {
			'()': 'chat.log_filters.ContextFilter',
		}
	},
	'handlers': {
		'file-tornado': {
			'level': 'DEBUG',
			'class': 'logging.handlers.TimedRotatingFileHandler',
			'filename': join(BASE_DIR, 'log/', log_file_name),
			'formatter': 'django',
			'when': 'midnight',
			'interval': 1
		},
		'file': {
			'level': 'DEBUG',
			'class': 'logging.handlers.TimedRotatingFileHandler',
			'filename': join(BASE_DIR, 'log/', log_file_name),
			'formatter': 'django',
			'filters': ['id', ],
			'when': 'midnight',
			'interval': 1
		},
		'django-console': {
			'level': 'DEBUG',
			'class': 'logging.StreamHandler',
			'formatter': 'django',
			'filters': ['id', ]
		},
		'tornado-console': {
			'level': 'DEBUG',
			'class': 'logging.StreamHandler',
			'formatter': 'django',
		},
	},
	'loggers': {
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
	},
	'formatters': {
		'django': {
			'format': '%(id)s [%(asctime)s:%(msecs)03d;%(ip)s;%(module)s:%(lineno)s]: %(message)s',
			'datefmt': '%H:%M:%S',
		},
	},
}

WS_ID_CHAR_LENGTH = 4


logging.config.dictConfig(LOGGING)

DEFAULT_PROFILE_ID = 1
# for gmail or google apps
EMAIL_USE_TLS = True
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_HOST_USER = 'chat.django@gmail.com'
EMAIL_HOST_PASSWORD = 'Ilovepython'

ISSUES_REPORT_LINK = 'https://github.com/Deathangel908/djangochat/issues/new'

SESSION_COOKIE_NAME = "sessionid"

MEDIA_ROOT = os.path.join(BASE_DIR, 'photos')

MEDIA_URL = "/photo/"

USER_COOKIE_NAME = 'user'
JS_CONSOLE_LOGS = True

# If this options is set, on every oncoming request chat will gather info about user location

IP_API_URL = 'http://ip-api.com/json/%s'

ALL_REDIS_ROOM = 'all'
WEBRTC_CONNECTION = 'webrtc_conn'
ALL_ROOM_ID = 1

SELECT_SELF_ROOM = """SELECT
	a.id as room__id,
	a.disabled as room__disabled
FROM chat_room a
WHERE a.id IN %s AND
			EXISTS
			(
					SELECT 1
					FROM chat_room_users b
					WHERE a.id = b.room_id
					HAVING COUNT(b.user_id) = 1
			)"""

UPDATE_LAST_READ_MESSAGE = """
UPDATE chat_room_users out_cru
	INNER JOIN
		(SELECT
			max(chat_message.id) message_id,
			chat_room_users.id rooms_users_id
		 FROM chat_room_users
			JOIN chat_message ON chat_message.room_id = chat_room_users.room_id
		WHERE chat_room_users.user_id = %s and chat_room_users.room_id != {}
		GROUP BY chat_message.room_id) last_message ON out_cru.id = last_message.rooms_users_id
SET out_cru.last_read_message_id = last_message.message_id 
""".format(ALL_ROOM_ID)

# ---------------JAVASCRIPT CONSTANTS --------------------

VALIDATION_IS_OK = 'ok'
MAX_USERNAME_LENGTH = 16
MAX_MESSAGE_SIZE = 100000
GENDERS = {0: 'Secret', 1: 'Male', 2: 'Female', }
#
DATE_INPUT_FORMATS = ('%Y-%m-%d',)  # html5 input date default format, see also Pikaday in js
DATE_INPUT_FORMATS_JS = 'YYYY-MM-DD'  # html5 input date default format, see also Pikaday in js, TODO webrtc.js
USE_L10N = False  # use DATE_INPUT_FORMATS as main format for date rendering
