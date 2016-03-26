import inspect
import sys
from django.contrib import admin
from django.contrib.admin import SimpleListFilter
from django.db.models import Count
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


class RegisteredFilter(SimpleListFilter):
	title = 'if registered'
	parameter_name = 'registered'

	def lookups(self, request, model_admin):
		return ((False, ('Registered')), (True, 'Anonymous'))

	def queryset(self, request, queryset):
		if self.value():
			return queryset.filter(user__isnull=self.value() == 'True')
		else:
			return queryset


class CountryFilter(SimpleListFilter):
	title = 'country'
	parameter_name = 'country'

	def lookups(self, request, model_admin):
		query_set = model_admin.model.objects.values('ip__country').annotate(count=Count('ip__country'))
		return [(c['ip__country'], '%s(%s)' % (c['ip__country'], c['count'])) for c in query_set]

	def queryset(self, request, queryset):
		if self.value():
			return queryset.filter(ip__country=self.value())
		else:
			return queryset


@admin.register(UserJoinedInfo)
class UserLocation(admin.ModelAdmin):
	list_display = ['username', 'country', 'region', 'city', 'provider', 'time', 'ip']
	list_filter = (RegisteredFilter, CountryFilter, 'time')
	search_fields = ('user__username', 'anon_name')

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
