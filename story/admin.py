from django.contrib import admin
from .models import Messages, UserProfile, UserSettings

admin.site.register(UserProfile)
admin.site.register(Messages)
admin.site.register(UserSettings)