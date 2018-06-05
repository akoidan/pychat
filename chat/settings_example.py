### Rename this file to chat/settings.py
### 3 hashtag in this file tells you want to do, while single hastag is required to uncomment

### DON't EDIT THIS SECTION
###<<<<<
import importlib
import os

get = os.environ.get('PYCHAT_CONFIG')
configs = ['docker', 'local', 'prod', 'docker_all']
if get not in configs:
	raise Exception("Expected environment variable PYCHAT_CONFIG to be one of {}. Please execute `export PYCHAT_CONFIG=local` if you don't know what to do.".format(configs))
config = 'chat.settings_{}'.format(get)
globals().update(importlib.import_module(config).__dict__)
###>>>>

### Replace with your django secret key, use the command bellow to audogenerate it
### bash download_content.sh generate_secret_key
# SECRET_KEY = '**************************************************'


### Replace with your timezone. You can find list of timezones here https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
# TIME_ZONE = 'Europe/Kiev'

### this this emails settings will be used to send emails. E.g. when user restores password via email.
###  Comment them out if you don't want to setup
# ADMINS = [('YourName', 'emailAddresThatYouWillReceiveReportsOn@gmail.com'), ]

# EMAIL_USE_TLS = True
# EMAIL_HOST = 'localhost'
# EMAIL_PORT = 25
# EMAIL_HOST_USER = ''
# EMAIL_HOST_PASSWORD = ''
# SERVER_EMAIL = 'root@pychat.org'
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'


### Gmail smpt (from account) settings example:
#EMAIL_USE_TLS = True
#EMAIL_HOST = 'smtp.gmail.com' # For gmail settings example
#EMAIL_PORT = '587' # google smpt port
#EMAIL_HOST_USER = 'chat.django@gmail.com'
#EMAIL_HOST_PASSWORD = 'Ilovepython'
#SERVER_EMAIL = 'chat.django@gmail.com'
#EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

### Pychat also supports https://developers.google.com/web/fundamentals/push-notifications/ firebase notifications, like in facebook.
### They will fire even user doesn't have opened tab. That can be turned on/off by used in his/her profile with checkbox `Notifications`.
### The implementation is similar like https://github.com/GoogleChrome/samples/tree/gh-pages/push-messaging-and-notifications.
###    1. Create a project on the Firebase Developer Console: https://console.firebase.google.com/
###    2. Go to Settings (the cog near the top left corner), click the Cloud Messaging Tab: https://console.firebase.google.com/u/1/project/pychat-org/settings/cloudmessaging/
###    3. Put `<Your Cloud Messaging API Key ...>` to `FIREBASE_API_KEY` below.
###    4. Create `chat/static/manifest.json` with content like https://github.com/GoogleChrome/samples/blob/gh-pages/push-messaging-and-notifications/manifest.sample.json:
###
### {
###  "name": "Pychat Push Notifications",
###  "short_name": "PyPush",
###  "start_url": "/",
###  "display": "standalone",
###  "gcm_sender_id": "<Your Sender ID from https://console.firebase.google.com>"
### }

# FIREBASE_API_KEY = '***********:********************************************************************************************************************************************'


#### If you want to use giphy images that appears if user types "/giphy example".
### To get those -sign up in https://developers.giphy.com/, create a new app and replaced with its key.
# GIPHY_API_KEY = '********************************'


### If you want recaptcha: Open https://www.google.com/recaptcha/admin#list and register new domain
# RECAPTCHA_PUBLIC_KEY = '****************************************' # REPLACE_THIS_WITH_DATA-SITEKEY_DIV_ATTRIBUTE
# RECAPTCHA_PRIVATE_KEY = '****************************************' # REPLACE_THIS_WITH_KEY_FOR_RETRIEVING_RESULT
# INSTALLED_APPS = ('snowpenguin.django.recaptcha2', 'multi_captcha_admin') + INSTALLED_APPS # Uncomment this row as well so you have django admin login with captcha as well

### For google auth follow the instructions here https://developers.google.com/identity/sign-in/web/devconsole-project
# GOOGLE_OAUTH_2_CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com'
# GOOGLE_OAUTH_2_HOST = 'your.domain.com'

### For facebook auth:
# FACEBOOK_ACCESS_TOKEN = '***************|***************************' # https://developers.facebook.com/tools/access_token/
# FACEBOOK_APP_ID = '16_NUMBER_APP_ID' # https://developers.facebook.com/apps/

###<<<<<
SESSION_REDIS = {
	'host': REDIS_HOST,
	'port': REDIS_PORT,
	'db': REDIS_SESSION_DB
}
###>>>>