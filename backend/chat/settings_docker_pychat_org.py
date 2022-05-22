import importlib
import os

from chat.settings_prod import *


STATIC_URL = 'https://static.pychat.org/'
# MEDIA_URL = "https://static.pychat.org/photo/"
ADMINS = [('admin', 'deathangel908@gmail.com'), ]
EMAIL_USE_TLS = True
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
SERVER_ADDRESS='pychat.org'
DEBUG=False
EMAIL_HOST = os.environ['EMAIL_HOST']
EMAIL_PORT = os.environ['EMAIL_PORT']
EMAIL_HOST_USER = os.environ['EMAIL_HOST_USER']
SECRET_KEY = os.environ['SECRET_KEY']
EMAIL_HOST_PASSWORD = os.environ['EMAIL_HOST_PASSWORD']
SERVER_EMAIL = os.environ['SERVER_EMAIL']
DEFAULT_PROFILE_ID = int(os.environ['DEFAULT_PROFILE_ID'])
RECAPTCHA_PUBLIC_KEY = os.environ['RECAPTCHA_PUBLIC_KEY']
RECAPTCHA_PRIVATE_KEY = os.environ['RECAPTCHA_PRIVATE_KEY']
GOOGLE_OAUTH_2_CLIENT_ID = os.environ['GOOGLE_OAUTH_2_CLIENT_ID']
FACEBOOK_ACCESS_TOKEN = os.environ['FACEBOOK_ACCESS_TOKEN']
FIREBASE_API_KEY = os.environ['FIREBASE_API_KEY']
GIPHY_API_KEY = os.environ['GIPHY_API_KEY']
REDIS_PORT = os.environ['REDIS_PORT']
REDIS_HOST = os.environ['REDIS_HOST']

SHOW_COUNTRY_CODE=True
DATABASES = {
	'default': {
		'ENGINE': 'chat',  # django.db.backends.sqlite3
		'NAME': os.environ['MYSQL_DATABASE'],
		'USER': os.environ['MYSQL_USER'],
		'PASSWORD': os.environ['MYSQL_PASSWORD'],
		'HOST': os.environ['MYSQL_HOST'],
		'default-character-set': 'utf8mb4',
		'charset': 'utf8mb4',
		'OPTIONS': {
			'autocommit': True,
		},
	}
}
