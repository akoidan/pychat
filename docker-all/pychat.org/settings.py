import importlib
import os

get = os.environ.get('PYCHAT_CONFIG')
configs = ['docker', 'local', 'prod', 'docker_all']
if get not in configs:
	raise Exception("Expected environment variable PYCHAT_CONFIG to be one of {}. Please execute `export PYCHAT_CONFIG=local` if you don't know what to do.".format(configs))
config = 'chat.settings_{}'.format(get)
globals().update(importlib.import_module(config).__dict__)
SECRET_KEY = '2j0kt3t09(99fpde%g4!#=+&@5g^um1^56ue-fuho4v*9ezyxd'
EMAIL_USE_TLS = True
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = '587'
EMAIL_HOST_USER = 'chat.django@gmail.com'
EMAIL_HOST_PASSWORD = 'Ilovepython' # IDGAF
SERVER_EMAIL = 'root@pychat.org'
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
ADMINS = [('dd', 'deathangel908@gmail.com'), ]
SESSION_REDIS = {
	'host': REDIS_HOST,
	'port': REDIS_PORT,
	'db': REDIS_SESSION_DB
}
