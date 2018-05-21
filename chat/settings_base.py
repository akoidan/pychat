"""
Django settings for myproject project.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.6/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
import sys
from os.path import join

from django.conf import global_settings

import chat as project_module

LOGGING_CONFIG = None

BASE_DIR = os.path.dirname(os.path.dirname(__file__))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.6/howto/deployment/checklist/

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
	"sslserver",
	"captcha_admin",
	"admin"
)


RECAPTHCA_SITE_URL = 'https://www.google.com/recaptcha/api.js'
# RECAPTCHA_PRIVATE_KEY = 'REPLACE_THIS_WITH_KEY_FOR_RETRIEVING_RESULT'
# RECAPTCHA_PUBLIC_KEY = 'REPLACE_THIS_WITH_DATA-SITEKEY_DIV_ATTRIBUTE'
# GOOGLE_OAUTH_2_CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com'
GOOGLE_OAUTH_2_JS_URL = 'https://apis.google.com/js/platform.js'
FACEBOOK_JS_URL = '//connect.facebook.net/en_US/sdk.js'

EMAIL_SUBJECT_PREFIX = '[Pychat] '

REDIS_PORT = 6379
REDIS_HOST ='localhost'
SESSION_REDIS = {
	'host': REDIS_HOST,
	'post': REDIS_PORT,
	'db': 3
}
SESSION_ENGINE = 'redis_sessions.session'


# BROKER_URL = str(SESSION_REDIS_PORT).join(('redis://localhost:','/0'))
# CELERY_ACCEPT_CONTENT = ['json']
# CELERY_TASK_SERIALIZER = 'json'
# CELERY_RESULT_SERIALIZER = 'json'


mail_admins = {
	'mail_admins': {
		'level': 'ERROR',
		'class': 'django.utils.log.AdminEmailHandler',
	}
}


LOGGING = {
	'version': 1,
	'disable_existing_loggers': True,
	'filters': {
		'id': {
			'()': 'chat.log_filters.ContextFilter',
		}
	},
	'formatters': {
		'django': {
			'format': '%(id)s [%(asctime)s:%(msecs)03d;%(ip)s;%(module)s:%(lineno)s]: %(message)s',
			'datefmt': '%H:%M:%S',
		},
	},
}

file_handlers = {
	'default': {
		'level': 'DEBUG',
		'class': 'logging.handlers.TimedRotatingFileHandler',
		'formatter': 'django',
		'when': 'midnight',
		'filters': ['id', ],
		'interval': 1
	},
}

console_handlers = {
	'default': {
		'level': 'DEBUG',
		'class': 'logging.StreamHandler',
		'filters': ['id', ],
		'formatter': 'django',
	},
}

API_PORT = '8888'

if 'start_tornado' in sys.argv:
	try:
		index_port = sys.argv.index('--port')
		API_PORT = sys.argv[index_port + 1]
	except (ValueError, IndexError):
		pass
	file_handlers['default']['filename'] = join(BASE_DIR, 'log/tornado-{}.log'.format(API_PORT))
else:
	file_handlers['default']['filename'] = join(BASE_DIR, 'log/chat.log')


EXTENSION_ID = 'cnlplcfdldebgdlcmpkafcialnbopedn'
EXTENSION_INSTALL_URL = 'https://chrome.google.com/webstore/detail/pychat-screensharing-exte/' + EXTENSION_ID

IS_HTTPS = True
WEBSOCKET_PROTOCOL = 'wss' if IS_HTTPS else 'ws'
SITE_PROTOCOL = 'https' if IS_HTTPS else 'http'
API_ADDRESS_PATTERN = ''.join((WEBSOCKET_PROTOCOL, '://%s:', API_PORT, '/?id='))

# GIPHY_API_KEY = 'thZMTtDfFdugqPDIAY461GzYTctuYIeIj' // TODO paste your GIPHY api key from https://developers.giphy.com/
GIPHY_URL= 'http://api.giphy.com/v1/gifs/search?api_key={}&limit=1&q={}'
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

DATABASES = {
	'default': {
		'ENGINE': 'django.db.backends.mysql',  # django.db.backends.sqlite3
		'NAME': 'pychat',
		'USER': 'root',
		'PASSWORD': '',
		'HOST': 'localhost',
		'default-character-set': 'utf8',
		'OPTIONS': {
			'autocommit': True,
		},
	}
}

CACHES = {
	'default': {
		'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
	}
}

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Europe/Kiev'

USE_I18N = True

USE_L10N = True

USE_TZ = True

DEFAULT_CHARSET = 'utf-8'

handler404 = 'chat.views.handler404'

STATIC_URL = '/static/'

PROJECT_DIR = os.path.dirname(os.path.realpath(project_module.__file__))

STATIC_ROOT = os.path.join(PROJECT_DIR, 'static')
SMILEYS_ROOT = os.path.join(STATIC_ROOT, 'smileys')
MESSAGES_PER_SEARCH = 10
AUTH_PROFILE_MODULE = 'chat.UserProfile'


TEMPLATES = [{
	'BACKEND': 'django.template.backends.django.DjangoTemplates',
	'DIRS': [join(BASE_DIR, 'templates')],
	'OPTIONS': {
		'context_processors': global_settings.TEMPLATE_CONTEXT_PROCESSORS + [username_processor]
	}
}]


WS_ID_CHAR_LENGTH = 4


DEFAULT_PROFILE_ID = 1

ISSUES_REPORT_LINK = 'https://github.com/Deathangel908/pychat/issues/new'

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

PING_CLOSE_JS_DELAY = 10000  # milliseconds
PING_INTERVAL = 300000  # milliseconds

PING_CLOSE_SERVER_DELAY = PING_CLOSE_JS_DELAY / 1000  # seconds
CLIENT_NO_SERVER_PING_CLOSE_TIMEOUT = PING_INTERVAL * 1.01 + PING_CLOSE_JS_DELAY  # milliseconds

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
		WHERE chat_room_users.user_id = %s
		GROUP BY chat_message.room_id) last_message ON out_cru.id = last_message.rooms_users_id
SET out_cru.last_read_message_id = last_message.message_id 
"""

# ---------------JAVASCRIPT CONSTANTS --------------------

VALIDATION_IS_OK = 'ok'
MAX_USERNAME_LENGTH = 16
MAX_MESSAGE_SIZE = 100000
GENDERS = {0: 'Secret', 1: 'Male', 2: 'Female', }
#
DATE_INPUT_FORMATS = ('%Y-%m-%d',)  # html5 input date default format, see also Pikaday in js
DATE_INPUT_FORMATS_JS = 'YYYY-MM-DD'  # html5 input date default format, see also Pikaday in js, TODO webrtc.js
USE_L10N = False  # use DATE_INPUT_FORMATS as main format for date rendering


