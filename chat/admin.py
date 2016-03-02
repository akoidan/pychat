import inspect
import sys

from django.contrib import admin

from chat import models

model_classes = (class_name[1] for class_name in inspect.getmembers(sys.modules[models.__name__], inspect.isclass)
					  if class_name[1].__module__ == models.__name__)
for model in model_classes:
	fields = [field.name for field in model._meta.fields if field.name not in ("password")]
	admin.site.register(model, type('SubClass', (admin.ModelAdmin,), {'fields': fields, 'list_display': fields}))