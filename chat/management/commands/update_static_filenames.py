import os

import subprocess

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
			print(path)
			mime = subprocess.Popen(
				"/usr/bin/file -b --mime-type {}".format(path),
				shell=True,
				stdout=subprocess.PIPE
			).communicate()[0]
			if isinstance(mime, bytes):  # py2 py3 support
				mime = mime.decode('utf-8')
			ext_base = mime.split('/')
			if len(ext_base) == 2:
				ext = "".join(('x.',ext_base[1].strip()))
			else:
				ext = 'x'
			new_name = get_random_path(None, ext)
			new_path = os.sep.join((os.path.dirname(path), new_name))
			os.rename(path, new_path)
			field.name = new_name
			obj.save()
