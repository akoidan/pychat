import sys

try:  # py2
	from urllib import urlopen
except ImportError:  # py3
	from urllib.request import urlopen


try:  # py2
	from urlparse import urlparse
except ImportError:  # py3
	from urllib.parse import urlparse

str_type = str if sys.version > '3' else basestring