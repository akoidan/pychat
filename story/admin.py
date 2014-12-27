from django.contrib import admin
from .models import *

admin.site.register(UserProfile)
admin.site.register(Messages)
admin.site.register(UserSettings)