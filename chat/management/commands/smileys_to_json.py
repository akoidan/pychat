import json
import re


if __name__ == '__main__':
	p = re.compile(r'^(\w+\.\w+)|"(.*)"')
	file = '/home/andrew/djangochat/Smilies.txt'  # sys.argv[1]
	a = 0
	with open(file, 'rb') as f:

		result = {}
		for line in f:
			a += 1
			res = p.findall(line.decode('cp1251'))
			if res:
				key = int(a / 64)*123
				result.setdefault(key, {})
				smiley_pattern = re.compile(r'^:.*:$')
				res_single = res[1][1]
				if not smiley_pattern.match(res_single):
					res_single = ":%s:" % res_single
				result[key][res_single] = res[0][0]
			else:
				raise Exception(line)
		str_res = json.dumps(result)
		print(str_res)
