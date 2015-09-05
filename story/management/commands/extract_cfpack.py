import json
import re

__author__ = 'bomzhe'
# cfpack stealer cfpack_st101.zip
# http://alexforum.ws/showthread.php?t=3911&page=3
from django.core.management import BaseCommand
import struct
import os
import sys
from time import strftime


class Command(BaseCommand):

	def __init__(self):
		super().__init__()
		self.pack_path = sys.argv[2]
		gif_dir_name = os.path.basename(self.pack_path).split('.')[0]
		parent_dir = os.path.dirname(sys.argv[0])
		self.gif_dir_path = os.sep.join((parent_dir, gif_dir_name))
		self.ext = {
			b'\x47\x49': 'gif',
			b'\xff\xd8': 'jpg',
			b'\x89\x50': 'png',
			b'\x42\x4d': 'bmp'
		}
		self.smiley_pattern = re.compile(r'^:.*:$')

	help = 'Extracts files from Commfort chat cfpack'
	args = 'file_self.path'

	can_import_settings = False
	leave_locale_alone = True

	def handle(self, *args, **options):

		print('\nCFPack Stealer 1.01\n')

		if not os.path.exists(self.pack_path):
			raise FileNotFoundError("cfpack file <<%s>> doesn't exist" % self.pack_path)
		info = self.extract_file()
		self.create_json_info(info)
		print(strftime('[%H:%M:%S] Done.'))

	def extract_file(self):
		with open(self.pack_path, 'rb') as f:
			addition_info, cats = {}, []
			smileys = {}

			if not os.path.exists(self.gif_dir_path):
				os.mkdir(self.gif_dir_path)
			print(strftime('[%H:%M:%S] Please wait.'))
			size = struct.unpack('<H', f.read(2))  # header size (useless)
			addition_info['width'], addition_info['height'], count = struct.unpack('<HHB', f.read(5))
			for c in range(count):
				size = ord(f.read(1)) * 2  # 2 байта на символ utf16
				cats.append((f.read(size)).decode('utf-16le'))  # запоминаем категории
				addition_info[cats[c]] = []
				if not os.path.exists(self.gif_dir_path + os.sep + cats[c]):
					os.mkdir(self.gif_dir_path + os.sep + cats[c])
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
				file_ext = self.ext.get(data[:2], '')
				file_name = '{0:04x}.{1}'.format(item, file_ext)
				tab = cats[cat_cur]
				gif_file_path = os.sep.join((self.gif_dir_path, tab, file_name))
				smileys.setdefault(tab, {})
				if not self.smiley_pattern.match(alias):
					alias = ":%s:" % alias
				smileys[tab][alias] = file_name
				with open(gif_file_path, 'wb') as gif:
					gif.write(data)
		return smileys

	def create_json_info(self, info):
		info_file_name = os.sep.join((self.gif_dir_path , 'info.json'))
		with open(info_file_name, 'w', encoding='utf-8') as f:
			f.write(json.dumps(info))