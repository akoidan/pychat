"""
Django settings for myproject project.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.6/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
from os.path import join

from django.conf import global_settings

import chat as project_module

LOGGING_CONFIG = None

BASE_DIR = os.path.dirname(os.path.dirname(__file__))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.6/howto/deployment/checklist/

# Application definition

INSTALLED_APPS = (
	'django.contrib.auth', # TODO do we need these tables?
	'django.contrib.contenttypes',
	'django.db.migrations',
	'chat',
)

MULTI_CAPTCHA_ADMIN = {
    'engine': 'recaptcha2',
}

SHOW_COUNTRY_CODE = True

EMAIL_SUBJECT_PREFIX = '[Pychat] '

REDIS_PORT = 6379
REDIS_HOST ='localhost'
REDIS_DB = 0


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


EXTENSION_ID = 'cnlplcfdldebgdlcmpkafcialnbopedn'
EXTENSION_INSTALL_URL = 'https://chrome.google.com/webstore/detail/pychat-screensharing-exte/' + EXTENSION_ID

# GIPHY_API_KEY = 'thZMTtDfFdugqPDIAY461GzYTctuYIeIj' // TODO paste your GIPHY api key from https://developers.giphy.com/
GIPHY_URL= 'http://api.giphy.com/v1/gifs/search?api_key={}&limit=1&q={}'
GIPHY_REGEX = r"^\s*\/giphy (.+)"
# SESSION_COOKIE_AGE = 10
# SESSION_SAVE_EVERY_REQUEST = True
# SESSION_EXPIRE_AT_BROWSER_CLOSE = True

AUTH_USER_MODEL = 'chat.User'

FIREBASE_URL = 'https://fcm.googleapis.com/fcm/send'

CONCURRENT_THREAD_WORKERS = 10

# Database
# https://docs.djangoproject.com/en/1.6/ref/settings/#databases
# pip install PyMySQL
# import pymysql
# pymysql.install_as_MySQLdb()

DATABASES = {
	'default': {
		'ENGINE': 'mysql_server_has_gone_away',  # django.db.backends.sqlite3
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


FROM_EMAIL = 'pychat'

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Europe/Kiev'

USE_I18N = True

USE_L10N = True

USE_TZ = True

DEFAULT_CHARSET = 'utf-8'


PROJECT_DIR = os.path.dirname(os.path.realpath(project_module.__file__))

MESSAGES_PER_SEARCH = 10
AUTH_PROFILE_MODULE = 'chat.UserProfile'


TEMPLATES = [{
	'BACKEND': 'django.template.backends.django.DjangoTemplates',
	'DIRS': [join(BASE_DIR, 'templates')],
	'OPTIONS': {
		'context_processors': [
			'django.template.context_processors.debug',
			'django.template.context_processors.request',
			'django.contrib.auth.context_processors.auth',
			'django.contrib.messages.context_processors.messages',
		],
	}
}]


WS_ID_CHAR_LENGTH = 4

ISSUES_REPORT_LINK = 'https://github.com/akoidan/pychat/issues/new'

MEDIA_ROOT = os.path.join(BASE_DIR, 'photos')

MEDIA_URL = "/photo/"

JS_CONSOLE_LOGS = 'debug'

# If this options is set, on every oncoming request chat will gather info about user location

IP_API_URL = 'http://ip-api.com/json/%s'

ALL_REDIS_ROOM = 'all'
ALL_ROOM_ID = 1

PING_CLOSE_JS_DELAY = 10000  # milliseconds
PING_INTERVAL = 300000  # milliseconds

PING_CLOSE_SERVER_DELAY = PING_CLOSE_JS_DELAY / 1000  # seconds
CLIENT_NO_SERVER_PING_CLOSE_TIMEOUT = PING_INTERVAL * 1.01 + PING_CLOSE_JS_DELAY  # milliseconds

# ---------------JAVASCRIPT CONSTANTS --------------------

VALIDATION_IS_OK = 'ok'
MAX_USERNAME_LENGTH = 16
MAX_MESSAGE_SIZE = 100000
GENDERS = {0: 'Secret', 1: 'Male', 2: 'Female', }
GENDERS_STR = { 'Secret': 0, 'Male': 1, 'Female':2 }
#
DATE_INPUT_FORMATS = ('%Y-%m-%d',)  # html5 input date default format, see also Pikaday in js
DATE_INPUT_FORMATS_JS = 'YYYY-MM-DD'  # html5 input date default format, see also Pikaday in js, TODO webrtc.js
USE_L10N = False  # use DATE_INPUT_FORMATS as main format for date rendering


