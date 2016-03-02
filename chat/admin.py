from django.contrib import admin

from chat.models import Message, IpAddress, Issue, Room, UserProfile

models = (Message, IpAddress, Issue, Room,UserProfile)
for model in models:
	fields = [field.name for field in model._meta.fields if field.name not in ("password")]
	admin.site.register(model, type('SubClass', (admin.ModelAdmin,), {'fields': fields, 'list_display': fields}))