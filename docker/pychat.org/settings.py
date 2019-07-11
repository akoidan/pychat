from chat.settings_docker import *

SECRET_KEY = '2j0kt3t09(99fpde%g4!#=+&@5g^um1^56ue-fuho4v*9ezyxd'
GIPHY_API_KEY = 'thZMTtWsaBQAPDIAY461GzYTctuYIeIj'

EMAIL_USE_TLS = True
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = '587'
EMAIL_HOST_USER = 'chat.django@gmail.com'
EMAIL_HOST_PASSWORD = 'Ilovepython' # IDGAF
SERVER_EMAIL = 'root@pychat.org'
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
ADMINS = [('dd', 'deathangel908@gmail.com'), ]
