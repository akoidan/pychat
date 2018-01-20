REDIS_HOST = 'redis'
DATABASES = {
	'default': {
		'ENGINE': 'django.db.backends.mysql',
		'NAME': 'pychat',
		'USER': 'pychat',
		'PASSWORD': 'pypass',
		'HOST': 'db',
		'PORT': '3306',  # mysql uses socket if host is localhost
		'OPTIONS': {
			'autocommit': True,
		},
	}
}

API_ADDRESS_PATTERN = 'wss://%s:8000/ws?id='