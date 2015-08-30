import re
from subprocess import call

from django.core.management import BaseCommand

SMILES_DIR = "/tmp/smiles"


class Command(BaseCommand):
	help = 'Just loads smiles files from custon site'

	def handle(self, *args, **options):
		call(["wget", "http://emoticons-hangulatjelek.blogspot.com/p/emoticons.html", "-O", "/tmp/smiles.html"])

		p = re.compile(r'http:\/\/[^"]*\.gif')
		html_file = open('/tmp/smiles.html', 'r')
		file_content = html_file.read()
		result_regex = re.findall(p, file_content)
		call(["mkdir", "-p", SMILES_DIR])
		for url in result_regex:
			call(["wget", url, "-P", SMILES_DIR])
		print('Saving smiles to %s' % SMILES_DIR)
