import inspect
import sys
from django.contrib import admin
from django.utils.html import format_html

from chat import models
from chat.models import UserJoinedInfo
from chat.settings import STATIC_URL

exclude_auto = ('UserJoinedInfo',)
model_classes = (class_name[1] for class_name in inspect.getmembers(sys.modules[models.__name__], inspect.isclass)
					if class_name[1].__module__ == models.__name__ and class_name[0] not in exclude_auto)
for model in model_classes:
	fields = [field.name for field in model._meta.fields if field.name not in ("password")]
	admin.site.register(model, type('SubClass', (admin.ModelAdmin,), {'fields': fields, 'list_display': fields}))


@admin.register(UserJoinedInfo)
class UserLocation(admin.ModelAdmin):
	list_display = ['username', 'country', 'region', 'city', 'provider', 'time', 'ip']

	def region(self, instance):
		return instance.ip.region

	def city(self, instance):
		return instance.ip.city

	def provider(self, instance):
		return instance.ip.isp

	def username(self, instance):
		return instance.anon_name or instance.user

	def country(self, instance):
		iso2 = instance.ip.country_code if instance.ip.country_code else "None"
		return format_html("<span style='white-space:nowrap'><img src='{}/flags/{}.png' /> {}</span>",
			STATIC_URL,
			iso2.lower(),
			instance.ip.country)
