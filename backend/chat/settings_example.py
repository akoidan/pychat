### Rename this file to chat/settings.py
### 3 hashtag in this file tells you want to do, while single hastag is required to uncomment


########################################################################################################################
############################################# START REQUIRED SECTION ###################################################

### Uncomment a SINGLE import from 3 below
# from chat.settings_docker import * # If you run pychat inside of docker container uncomment this
# from chat.settings_local import * # If you run development server on your local machine uncomment this one
# from chat.settings_prod import * # if you run this in production without docker uncomment this

### Prevent host header attacks in emails
### this will used to sent emails with magic link, replce to your ip/domain , notice no trailing slash!
# SERVER_ADDRESS = 'https://192.168.1.15:8080'


### Replace with your django secret key, use the command bellow to audogenerate it
### bash download_content.sh generate_secret_key
# SECRET_KEY = '**************************************************'


############################################# END REQUIRED SECTION #####################################################
########################################################################################################################


########################################################################################################################
##################################### EVERYTHING BELOW IS OPTIONAL #####################################################


### Every email (like magic link will be marked with this lable)
# FROM_EMAIL = 'pychat'

### Uncomment this setting if you want to see everyone location. You may also need to enable FLAGS in production.json inside frontend directory
# SHOW_COUNTRY_CODE = True


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
#EMAIL_HOST_USER = 'yourgmailaccont@gmail.com'
#EMAIL_HOST_PASSWORD = 'yourgmailpassword'
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


### If you want recaptcha: Open https://www.google.com/recaptcha/admin#list and register new domain, type is web captcha
### If you set RECAPTCHA_PRIVATE_KEY you should set RECAPTCHA_PUBLIC_KEY in frontend/development.json and frontend/production.json
# RECAPTCHA_PRIVATE_KEY = '****************************************' # Secret key

### For google auth follow the instructions here https://developers.google.com/identity/sign-in/web/devconsole-project
### Select Web Browser type
# GOOGLE_OAUTH_2_CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com'


### For facebook auth:
# FACEBOOK_ACCESS_TOKEN = '**' # https://developers.facebook.com/apps/ -> click on app -> settings -> basic "App ID|App Secret" e.g. FACEBOOK_ACCESS_TOKEN = "91237|bf86sd3"