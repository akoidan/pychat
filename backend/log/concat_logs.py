import datetime
import re
from sys import argv


def get_order(f):
	line = f.readline()
	res = re.match(r"\w+:\w+\s\[(\d\d:\d\d:\d\d:\d\d\d);", line)
	d = datetime.datetime.strptime(res.group(1), '%H:%M:%S:%f') if res else None
	return line, d

f1 = open(argv[1] if len(argv) >= 2 else './tornado-8883.log')
f2 = open(argv[2] if len(argv) >= 3 else './tornado-8882.log')
f3 = open(argv[3] if len(argv) >= 3 else './tornado.log', 'w')

l1, d1 = get_order(f1)
l2, d2 = get_order(f2)

while True:
	if not l1 and not l2:
		break
	if l1 and ((not d1 and d2) or (d2 and d1 < d2) or not l2):
		f3.write(l1)
		l1, d1 = get_order(f1)
	elif l2:
		f3.write(l2)
		l2, d2 = get_order(f2)
	else:
		raise Exception(
			'Unexpected condition l1: "{}", l2: "{}", d1: "{}", d2: "{}"'.format(
				l1, l2, d1, d2
			)
		)
