import json
import os
import re
import struct
from time import strftime

from django.core.management.base import BaseCommand

from chat.py2_3 import get_unicode
from django.conf import settings

ext = {
	b'\x47\x49': 'gif',
	b'\xff\xd8': 'jpg',
	b'\x89\x50': 'png',
	b'\x42\x4d': 'bmp'
}

file_names_pattern = {
	"I" : "base",
	"II" : "girls",
	"III": "extra"
}

START_CHAR = 13313

smiley_pattern = re.compile(r'^:.*:$')


class Command(BaseCommand):
	requires_system_checks = False
	def __init__(self):
		super(Command, self).__init__()
	help = 'CFPack Stealer 1.01'

	def add_arguments(self, parser):
		parser.add_argument(
			'--source',
			dest='port',
			default= os.path.join(settings.BASE_DIR, 'DefaultSmilies.cfpack'),
			type=str,
		)

	def extract_file(self):
		with open(self.pack_path, 'rb') as f:
			addition_info, cats = {}, []
			smileys = {}
			start_char  = START_CHAR

			if not os.path.exists(settings.SMILEYS_ROOT):
				print("Created smileys dir" + settings.SMILEYS_ROOT)
				os.mkdir(settings.SMILEYS_ROOT)
			size = struct.unpack('<H', f.read(2))  # header size (useless)
			addition_info['width'], addition_info['height'], count = struct.unpack('<HHB', f.read(5))
			for c in range(count):
				size = ord(f.read(1)) * 2  # 2 bytes per utf8
				cats.append((f.read(size)).decode('utf-16le'))  # save category
				addition_info[cats[c]] = []
				tab_dir_path = os.sep.join((settings.SMILEYS_ROOT, file_names_pattern[cats[c]]))
				if not os.path.exists(tab_dir_path):
					os.mkdir(tab_dir_path)
			addition_info['count'] = struct.unpack('<H', f.read(2))[0]  # amount of bytes in a single pack
			for item in range(addition_info['count']):
				self.write_smile(cats, count, f, item, smileys, start_char)
		return smileys

	def write_smile(self, cats, count, f, item, smileys, start_char):
		f.seek(1, 1)  # skip header size
		cat_cur = ord(f.read(1))
		if cat_cur >= count:
			raise SyntaxError('File is not valid')
		size = ord(f.read(1)) * 2
		alias = (f.read(size)).decode('utf-16le')
		f.seek(1, 1)  # 0
		size = struct.unpack('<I', f.read(4))[0]
		data = f.read(size)
		file_ext = ext.get(data[:2], '')
		file_name = '{0:04x}.{1}'.format(item, file_ext)
		tab = file_names_pattern[cats[cat_cur]]
		gif_file_path = os.sep.join((settings.SMILEYS_ROOT, tab, file_name))
		smileys.setdefault(tab, [])
		start_char += 1
		if not smiley_pattern.match(alias):
			alias = ":%s:" % alias
		smileys[tab].append({
			'code': get_unicode(start_char),
			'alt': alias,
			'src': file_name,
		})
		with open(gif_file_path, 'wb') as gif:
			gif.write(data)

	def create_json_info(self, info):

		info_file_name = os.sep.join((settings.SMILEYS_ROOT, 'info.json'))
		with open(info_file_name, 'w') as f:
			f.write(json.dumps(info))

	def handle(self, *args, **options):
		self.pack_path = options['port']
		if not os.path.exists(self.pack_path):
			raise Exception("cfpack file <<%s>> doesn't exist" % self.pack_path)
		info = self.extract_file()
		self.create_json_info(info)
		print(strftime('[%H:%M:%S] Done.'))


