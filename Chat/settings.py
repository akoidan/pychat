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
LOGGING_CONFIG = None
from django.conf import global_settings

import story as project_module


BASE_DIR = os.path.dirname(os.path.dirname(__file__))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.6/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '8ou!cqb1yd)6c4h0i-cxjo&@@+04%4np6od8qn+z@5b=6)!v(o'

# SECURITY WARNING: don't run with debug turned on in production!

LOGGING_CONFIG = None
DEBUG = True
TEMPLATE_DEBUG = True
ALLOWED_HOSTS = ["127.0.0.1", ]

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
	'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'Chat.urls'

WSGI_APPLICATION = 'Chat.wsgi.application'

AUTH_USER_MODEL = 'story.UserProfile'

LOGIN_URL = '/'

# Database
# https://docs.djangoproject.com/en/1.6/ref/settings/#databases

# DATABASES = {
# 	'default': {
# 		'NAME': 'django',
# 		'ENGINE': 'mysql.connector.django',  # django.db.backends.sqlite3
# 		'USER': 'root',
# 		'default-character-set': 'utf8',
# 		'OPTIONS': {
# 			'autocommit': True,
#
# 		},
# 	}
# }

DATABASES = {
	'default': {
		'ENGINE': 'django.db.backends.sqlite3',
		'NAME': 'django.db',
	}
}

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


LOGGING = {
	'version': 1,
	'disable_existing_loggers': True,
	'handlers': {
		'file-tornado': {
			'level': 'DEBUG',
			'class': 'Chat.logger_handlers.RequestRotatingFileLogger',
			'filename': join(BASE_DIR, 'log/', 'torado.log'),
			'formatter': 'verbose',
		},
		'file-django': {
			'level': 'DEBUG',
			'class': 'Chat.logger_handlers.RequestRotatingFileLogger',
			'filename': join(BASE_DIR, 'log/', 'chat.log'),
			'formatter': 'verbose',
		},
		'console': {
			'level': 'DEBUG',
			'class': 'logging.StreamHandler',
			'formatter': 'verbose',
		},
	},
	'loggers': {
		# root logger
		'': {
			'handlers': ['file-django'],
		},
		'django.request': {
			'handlers': ['file-django'],
			'level': 'DEBUG',
			'propagate': False,
		},
	},

	'formatters': {
	'verbose': {
			'format':  '[%(asctime)s %(levelname)s]: %(message)s',
			'datefmt': '%H:%M:%S',
		},
	},
}

import logging.config
logging.config.dictConfig(LOGGING)


# for gmail or google apps
EMAIL_USE_TLS = True
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_HOST_USER = 'chat.django@gmail.com'
EMAIL_HOST_PASSWORD = 'Ilovepython'

MEDIA_ROOT = os.path.join(BASE_DIR, 'photos')

MEDIA_URL = "/photo/"

USER_COOKIE_NAME = 'user'

WS_ADDRESS_COOKIE_NAME = 'api'

######### JAVASCRIPT CONSTANTS #############
VALIDATION_IS_OK = 'ok'
MAX_USERNAME_LENGTH = 16
MAX_MESSAGE_SIZE = 10000
GENDERS = {0: 'Secret', 1: 'Male', 2: 'Female', }
#
DATE_INPUT_FORMATS = ('%Y-%m-%d',)  # html5 input date default format, see also Pikaday in js
DATE_INPUT_FORMATS_JS = 'YYYY-MM-DD'  # html5 input date default format, see also Pikaday in js
USE_L10N = False  # use DATE_INPUT_FORMATS as main format for date rendering