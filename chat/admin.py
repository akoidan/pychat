import inspect
import sys

from django.contrib import admin
from django.contrib.admin import SimpleListFilter
from django.core import urlresolvers
from django.db.models import Count, ForeignKey
from django.utils.html import format_html

from chat import models
from chat.models import UserJoinedInfo
from django.conf import settings

exclude_auto = ()
model_classes = (class_name[1] for class_name in inspect.getmembers(sys.modules[models.__name__], inspect.isclass)
					if class_name[1].__module__ == models.__name__ and class_name[0] not in exclude_auto)
for model in model_classes:
	fields = []
	class_struct = {'fields': fields, 'list_display': fields}
	for field in model._meta.fields:
		if isinstance(field, ForeignKey):
			def gen_link(field):
				def link(obj):
					print(field)
					another = getattr(obj, field.name)
					if another is None:
						return "Null"
					else:
						link = '/admin/chat/{}/{}/change'.format(another._meta.verbose_name, another.id)
						return u'<a href="%s">%s</a>' % (link, another.id)
				link.allow_tags = True
				link.__name__ = str(field.name)
				return link
			fields.append(gen_link(field))
		else:
			fields.append(field.name)

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
