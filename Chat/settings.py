"""
Django settings for myproject project.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.6/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
from logging.handlers import RotatingFileHandler
import os
from os.path import join
import sys

LOGGING_CONFIG = None
try:
	from Chat.production import * 
except ImportError:
	pass
from django.conf import global_settings

import story as project_module


BASE_DIR = os.path.dirname(os.path.dirname(__file__))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.6/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!

# SECURITY WARNING: don't run with debug turned on in production!


DEBUG = False
ALLOWED_HOSTS = ["*"]
TEMPLATE_DEBUG = False
#ALLOWED_HOSTS = ["127.0.0.1", ]

# TEMPLATE_DIRS = [BASE_DIR+'/templates']
TEMPLATE_DIRS = (
	join(BASE_DIR, 'templates'),
)

TEMPLATE_CONTEXT_PROCESSORS = global_settings.TEMPLATE_CONTEXT_PROCESSORS + (
	'story.context_processors.add_user_name',
)

# Application definition

INSTALLED_APPS = (
	'django.contrib.admin',
	'django.contrib.auth',
	'django.contrib.contenttypes',
	'django.contrib.sessions',
	'django.contrib.messages',
	'django.contrib.staticfiles',
	'django.db.migrations',
	'story',
	'simplejson',
	'redis',
	'tornado',
)

SESSION_ENGINE = 'redis_sessions.session'
# create session for anonymous
SESSION_SAVE_EVERY_REQUEST = True

API_PORT = '8888'


# SESSION_COOKIE_AGE = 10
# SESSION_SAVE_EVERY_REQUEST = True
# SESSION_EXPIRE_AT_BROWSER_CLOSE = True

MIDDLEWARE_CLASSES = (
	'django.middleware.csrf.CsrfViewMiddleware',
	'django.contrib.sessions.middleware.SessionMiddleware',
	'django.middleware.common.CommonMiddleware',
	'django.contrib.auth.middleware.AuthenticationMiddleware',
	'django.contrib.messages.middleware.MessageMiddleware',
	'story.cookies_middleware.UserCookieMiddleWare',
)

ROOT_URLCONF = 'Chat.urls'

WSGI_APPLICATION = 'Chat.wsgi.application'

AUTH_USER_MODEL = 'story.UserProfile'

LOGIN_URL = '/'

# Database
# https://docs.djangoproject.com/en/1.6/ref/settings/#databases

DATABASES = {
	'default': {
		'NAME': 'django',
		'ENGINE': 'django.db.backends.mysql',  # django.db.backends.sqlite3
		'USER': 'root',
		'default-character-set': 'utf8',
		'OPTIONS': {
			'autocommit': True,

		},
	}
}

#DATABASES = {
#	'default': {
#		'ENGINE': 'django.db.backends.sqlite3',
#		'NAME': 'django.db',
#	}
#}

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

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.6/howto/static-files/
STATIC_URL = '/static/'

PROJECT_DIR = os.path.dirname(os.path.realpath(project_module.__file__))

STATICFILES_DIRS = (
	os.path.join(PROJECT_DIR, 'static'),
)

# AUTH_PROFILE_MODULE = 'story.UserProfile'

if 'start_tornado' in sys.argv:
	log_file_name = 'tornado.log'
else:
	log_file_name = 'chat.log'

LOGGING = {
	'version': 1,
	'disable_existing_loggers': True,
	'filters': {
		'id': {
			'()': 'Chat.log_filters.ContextFilter',
		}
	},
	'handlers': {
		'file-tornado': {
			'level': 'DEBUG',
			'class': 'logging.handlers.TimedRotatingFileHandler',
			'filename': join(BASE_DIR, 'log/', log_file_name),
			'formatter': 'tornado',
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
			'formatter': 'tornado',
		},
	},
	'loggers': {
		# root logger
		'': {
			'handlers': ['file'],
			'level': 'DEBUG',
			'propagate': False,
		},
		'Chat.tornadoapp': {
			'handlers': ['file-tornado'],
			'level': 'DEBUG',
			'propagate': False,
		},
	},

	'formatters': {

	'tornado': {
			'format':  '%(id)s [%(asctime)s=%(lineno)s [%(username)s]: %(message)s',
			'datefmt': '%H:%M:%S',
		},
	'django': {
			'format':  '%(id)s [%(asctime)s %(module)s:%(lineno)s  [%(username)s]: %(message)s',
			'datefmt': '%H:%M:%S',
		},
	},
}

import logging.config
logging.config.dictConfig(LOGGING)

ISSUES_REPORT_LINK = 'https://github.com/Deathangel908/djangochat/issues/new'

MEDIA_ROOT = os.path.join(BASE_DIR, 'photos')

MEDIA_URL = "/photo/"

USER_COOKIE_NAME = 'user'

WS_ADDRESS_COOKIE_NAME = 'api'
ANONYMOUS_REDIS_ROOM = 'all'
REGISTERED_REDIS_ROOM = 'signed'

######### JAVASCRIPT CONSTANTS #############
VALIDATION_IS_OK = 'ok'
MAX_USERNAME_LENGTH = 16
MAX_MESSAGE_SIZE = 10000
GENDERS = {0: 'Secret', 1: 'Male', 2: 'Female', }
#
DATE_INPUT_FORMATS = ('%Y-%m-%d',)  # html5 input date default format, see also Pikaday in js
DATE_INPUT_FORMATS_JS = 'YYYY-MM-DD'  # html5 input date default format, see also Pikaday in js, TODO webrtc.js
USE_L10N = False  # use DATE_INPUT_FORMATS as main format for date rendering
