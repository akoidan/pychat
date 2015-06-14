from django.contrib import admin
from .models import Messages, UserProfile

admin.site.register(UserProfile)
admin.site.register(Messages)