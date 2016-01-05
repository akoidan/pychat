from django.contrib import admin

from chat.models import *

admin.site.register(User)
admin.site.register(Message)
admin.site.register(IpAddress)
admin.site.register(Issue)
admin.site.register(Room)
admin.site.register(UserProfile)