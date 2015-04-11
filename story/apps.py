import os
import xml.etree.ElementTree as etree
from subprocess import call
import socket
from builtins import FileNotFoundError
from django.apps import AppConfig
from django.core.exceptions import MiddlewareNotUsed

from Chat.settings import BASE_DIR, HOST_IP


class DefaultSettingsConfig(AppConfig):
	name = 'story'
	verbose_name = 'djangochat'

	colors = {}

	def check_redis_running(self):
		""":raise error if redis is not running"""
		try:
			result = call(["redis-cli", "ping"])
			if result != 0:
				print("Redis server is not running, trying to start in manually")
				# spout redis in background, shell= true finds command in PATH
				# subprocess.Popen(["redis"], shell=True)
				raise MiddlewareNotUsed("Can't establish connection with redis server. Please run `redis-server` command")
		except FileNotFoundError:
			raise MiddlewareNotUsed(
				"Can't find redis-cli. Probably redis in not installed or redis-cli is not in the PATH")

	def check_ishout_running(self):
		""":raise error if IShout is not running"""
		sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
		result = sock.connect_ex((HOST_IP, 5500))
		if result != 0:
			server_js = os.path.join(BASE_DIR, 'node_modules/ishout.js/server.js')
			raise MiddlewareNotUsed(
				"Can't establish connection with IShout.js. Please run `node " + server_js + '` command')
		# subprocess.Popen(["node", os.path.join(BASE_DIR, 'node_modules/ishout.js/server.js')])

	def load_config(self):
		"""Loads default color scheme for html chat page """
		tree = etree.parse(BASE_DIR + '/Chat/DefaultScheme.xml')
		root = tree.getroot().find('colors')
		for child in root:
			self.colors[child.tag] = child.text

	def ready(self):
		self.check_redis_running()
		self.check_ishout_running()
		self.load_config()

