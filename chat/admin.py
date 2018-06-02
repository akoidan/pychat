import inspect
import json
import sys
from datetime import datetime

from django.conf import settings
from django.contrib import admin
from django.db.models import ForeignKey
from django.utils.html import format_html

from chat import models

exclude_auto = ('User')
model_classes = (class_name[1] for class_name in inspect.getmembers(sys.modules[models.__name__], inspect.isclass)
		if class_name[1].__module__ == models.__name__ and class_name[0] not in exclude_auto)


def gen_fun(field):
	def col_name(o):
		attr = getattr(o, field)
		v = json.dumps(attr)
		if len(v) > 50:
			v = v[:50]
		return v

	return col_name


def country(instance):
	iso2 = instance.country_code if instance.country_code else "None"
	return format_html("<span style='white-space:nowrap'><img src='{}/flags/{}.png' /> {}</span>",
							 settings.STATIC_URL,
							 iso2.lower(),
							 instance.country)


def time(instance):
	d = datetime.fromtimestamp(instance.time / 1000).strftime('%Y-%m-%d %H:%M:%S')
	return format_html("<span style='white-space:nowrap'>{}</span>", d)


conf = {
	'ip address': {
		'extra_fields': (country,),
		'exclude_fields': ('country',),
		'list_filter': ('country', 'region', 'city'),
		'search_fields': ('ip',)
	},
	'message': {
		'extra_fields': (time,),
		'exclude_fields': ('time',),
		'list_filter': ('room', 'deleted', 'sender'),
		'search_fields': ('content', )
	},
	'room': {
		'list_filter': ('disabled',),
		'search_fields': ('name', )
	},
	'room users': {
		'list_filter': ('notifications', 'user', 'room'),
	},
	'subscription': {
		'list_filter': ('user', 'inactive', 'is_mobile', 'created', 'updated'),
		'search_fields': ('registration_id', )
	},
	'subscription messages': {
		'list_filter': ('subscription', 'received', 'message'),
	},
	'user joined info': {
		'list_filter': ('user', 'time'),
	},
	'issue details': {
		'list_filter': ('sender', 'time'),
	},
	'issue': {
		'search_fields': ('content', )
	},
	'user profile': {
		'list_filter': ('last_login', 'sex'),
		'search_fields': ('username', 'email' )
	},
	'verification': {
		'list_filter': ('verified', 'time'),
	},
}



for model in model_classes:
	vname = model._meta.verbose_name
	class_struct = {'fields': [], 'list_display': []}
	c = conf.get(vname, {})
	if c.get('list_filter') is not None:
		class_struct['list_filter'] = c['list_filter']
	for field in model._meta.fields:
		if field.name in c.get('exclude_fields', []):
			continue
		if field.name != 'id' and field.name != 'user_ptr':
			class_struct['fields'].append(field.name)
		if isinstance(field, ForeignKey):
			def gen_link(field):
				def link(obj):
					print(field)
					another = getattr(obj, field.name)
					if another is None:
						return "Null"
					else:
						another_name = another._meta.verbose_name
						another_link = another_name if another_name != 'user' else 'userprofile'
						another_link = another_link.replace(' ', '')
						link = '/admin/chat/{}/{}/change'.format(another_link, another.id)
						return u'<a href="%s">%s</a>' % (link, str(another))
				link.allow_tags = True
				link.__name__ = str(field.name)
				return link

			class_struct['list_display'].append(gen_link(field))
		else:
			class_struct['list_display'].append(field.name)
	if c.get('extra_fields') is not None:
		class_struct['list_display'].extend(c['extra_fields'])
	if c.get('search_fields') is not None:
		class_struct['search_fields'] = c['search_fields']
	admin.site.register(model, type(
		'SubClass',
		(admin.ModelAdmin,),
		class_struct
	))

# class CountryFilter(SimpleListFilter):
# 	title = 'country'
# 	parameter_name = 'country'
#
# 	def lookups(self, request, model_admin):
# 		query_set = model_admin.model.objects.values('ip__country').annotate(count=Count('ip__country'))
# 		return [(c['ip__country'], '%s(%s)' % (c['ip__country'], c['count'])) for c in query_set]
#
# 	def queryset(self, request, queryset):
# 		if self.value():
# 			return queryset.filter(ip__country=self.value())
# 		else:
# 			return queryset
#
#
# @admin.register(UserJoinedInfo)
# class UserLocation(admin.ModelAdmin):
# 	list_display = ["time", "link_to_B"]
#
# 	def link_to_B(self, obj):
# 		link = urlresolvers.reverse("admin:chat_user_change", args=[obj.Object.id])  # model name has to be lowercase
# 		return u'<a href="%s">%s</a>' % (link, obj.B.name)
#
# 	link_to_B.allow_tags = True
