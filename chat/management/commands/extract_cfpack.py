import json
import re

from chat.settings import BASE_DIR, SMILEYS_ROOT


# based on cfpack stealer cfpack_st101.zip http://alexforum.ws/showthread.php?t=3911&page=3
import struct
import os
from time import strftime
from django.core.management.base import BaseCommand
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

	def __init__(self):
		super(Command, self).__init__()
	help = 'CFPack Stealer 1.01'

	def add_arguments(self, parser):
		parser.add_argument(
			'--source',
			dest='port',
			default= os.path.join(BASE_DIR, 'DefaultSmilies.cfpack'),
			type=str,
		)

	def extract_file(self):
		with open(self.pack_path, 'rb') as f:
			addition_info, cats = {}, []
			smileys = {}
			start_char  = START_CHAR

			if not os.path.exists(SMILEYS_ROOT):
				print("Created smileys dir" + SMILEYS_ROOT)
				os.mkdir(SMILEYS_ROOT)
			size = struct.unpack('<H', f.read(2))  # header size (useless)
			addition_info['width'], addition_info['height'], count = struct.unpack('<HHB', f.read(5))
			for c in range(count):
				size = ord(f.read(1)) * 2  # 2 байта на символ utf16
				cats.append((f.read(size)).decode('utf-16le'))  # запоминаем категории
				addition_info[cats[c]] = []
				tab_dir_path = os.sep.join((SMILEYS_ROOT, file_names_pattern[cats[c]]))
				if not os.path.exists(tab_dir_path):
					os.mkdir(tab_dir_path)
			addition_info['count'] = struct.unpack('<H', f.read(2))[0]  # число смайлов в паке
			for item in range(addition_info['count']):
				f.seek(1, 1)  # размер заголовка пропускаем
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
				gif_file_path = os.sep.join((SMILEYS_ROOT, tab, file_name))
				smileys.setdefault(tab, [])
				start_char += 1
				if not smiley_pattern.match(alias):
					alias = ":%s:" % alias
				smileys[tab].append({
					'code': chr(start_char),
					'alt': alias,
					'src': file_name,
				})
				with open(gif_file_path, 'wb') as gif:
					gif.write(data)
		return smileys

	def create_json_info(self, info):

		info_file_name = os.sep.join((SMILEYS_ROOT, 'info.json'))
		with open(info_file_name, 'w', encoding='utf-8') as f:
			f.write(json.dumps(info))

	def handle(self, *args, **options):
		self.pack_path = options['port']
		if not os.path.exists(self.pack_path):
			raise FileNotFoundError("cfpack file <<%s>> doesn't exist" % self.pack_path)
		info = self.extract_file()
		self.create_json_info(info)
		print(strftime('[%H:%M:%S] Done.'))


