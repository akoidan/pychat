from django.contrib import admin
from .models import Message, User

admin.site.register(User)
admin.site.register(Message)