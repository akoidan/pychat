from __future__ import absolute_import
import datetime
import os
from celery import Celery
import time
## dd/mm/yyyy format
from celery.task import periodic_task
from django.conf import settings

# set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Chat.settings')

app = Celery('story')

# Using a string here means the worker will not have to
# pickle the object when using Windows.
app.config_from_object('django.conf:settings')
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)


@periodic_task(run_every=datetime.timedelta(minutes=1))
def debug_task():
	print (time.strftime("%d/%m/%Y"))
