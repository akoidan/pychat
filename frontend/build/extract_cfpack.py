import json
import os
import re
import struct
import sys
from time import strftime

def get_unicode(ch):
	if sys.version > '3':
		return chr(ch)
	else:
		return unichr(ch)

def extract_file():
	with open(pack_path, 'rb') as f:
		addition_info, cats = {}, []
		smileys = {}
		start_char  = START_CHAR

		if not os.path.exists(SMILEYS_ROOT):
			print("Created smileys dir" + SMILEYS_ROOT)
			os.mkdir(SMILEYS_ROOT)
		size = struct.unpack('<H', f.read(2))  # header size (useless)
		addition_info['width'], addition_info['height'], count = struct.unpack('<HHB', f.read(5))
		for c in range(count):
			size = ord(f.read(1)) * 2  # 2 bytes per utf8
			cats.append((f.read(size)).decode('utf-16le'))  # save category
			addition_info[cats[c]] = []
			tab_dir_path = os.sep.join((SMILEYS_ROOT, file_names_pattern[cats[c]]))
			if not os.path.exists(tab_dir_path):
				os.mkdir(tab_dir_path)
		addition_info['count'] = struct.unpack('<H', f.read(2))[0]  # amount of bytes in a single pack
		for item in range(addition_info['count']):
			start_char += 1
			write_smile(cats, count, f, item, smileys, start_char)
	return smileys

def write_smile( cats, count, f, item, smileys, start_char):
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
	gif_file_path = os.sep.join((SMILEYS_ROOT, tab, file_name))
	smileys.setdefault(tab, {})
	if not smiley_pattern.match(alias):
		alias = ":%s:" % alias
	smileys[tab][get_unicode(start_char)] = {
		'alt': alias,
		'src': file_name,
	}
	with open(gif_file_path, 'wb') as gif:
		gif.write(data)

def create_json_info( info):


	out = ""
	with open(OUTPUT_TS_FILE, 'w') as f:
		for (group,values) in info.items():
			for (k,v) in values.items():
				filename = v['src']
				if not filename.endswith('.gif'):
					raise Exception("Invalid file name {}".format(filename))
				file_without_gif = filename[:-len('.gif')]
				out += "import {group}_{value} from '../assets/smileys/{group}/{filename}';\n".format(group=group, value=file_without_gif, filename=filename)
				v['src'] = '{group}_{value}'.format(group=group, value=file_without_gif)
		f.write(out)
		f.write(json.dumps(info))

def handle():
	if not os.path.exists(pack_path):
		raise Exception("cfpack file <<%s>> doesn't exist" % pack_path)
	info = extract_file()
	create_json_info(info)
	print(strftime('[%H:%M:%S] Done.'))


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
root_path=os.path.abspath(os.path.join(os.path.dirname(os.path.realpath(__file__)), os.pardir))
SMILEYS_ROOT = os.sep.join((root_path, 'src', 'assets', 'smileys'))
OUTPUT_TS_FILE = os.sep.join((root_path, 'src', 'utils', 'staticFiles.ts'))
smiley_pattern = re.compile(r'^:.*:$')
pack_path = os.sep.join((root_path, 'build', 'DefaultSmilies.cfpack'))

handle()
