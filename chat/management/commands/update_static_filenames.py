import os

from chat.models import UserProfile, get_random_path, Message

__author__ = 'andrew'

from django.core.management import BaseCommand


class Command(BaseCommand):

	def handle(self, *args, **options):
		for up in UserProfile.objects.all():
			self.rename(up, 'photo')
		for up in Message.objects.all():
			self.rename(up, 'img')

	def rename(self, obj, attr):
		field = getattr(obj, attr)
		if field:
			path = field.path
			if not os.path.isfile(path):
				return
			new_name = get_random_path(None, "unname")
			new_path = os.sep.join((os.path.dirname(path), new_name))
			os.rename(path, new_path)
			field.name = new_name
			obj.save()
