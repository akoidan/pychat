import os

import re
from subprocess import call

from django.core.management import BaseCommand
from django.conf import settings


class Command(BaseCommand):
	help = "Compiles js if it's not compiled"

	def handle(self, *args, **options):
		join = os.path.join(settings.PROJECT_DIR, '..', 'fe', 'dist')
		for dirpath, dirnames, files in os.walk(join):
			if files:
				return
			break
		from subprocess import call
		call(["yarn", "run", 'prod'], cwd=os.path.join(settings.PROJECT_DIR, '..', 'fe'))
