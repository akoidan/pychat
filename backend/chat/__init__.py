from __future__ import absolute_import

import threading

default_app_config = 'chat.apps.DefaultSettingsConfig'

local = threading.local()
# This will make sure the app is always imported when
# Django starts so that shared_task will use this app.