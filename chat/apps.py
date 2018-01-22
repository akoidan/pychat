import xml.etree.ElementTree as etree

from django.apps import AppConfig

from django.conf import settings

class DefaultSettingsConfig(AppConfig):
	name = 'chat'
	verbose_name = 'djangochat'

	colors = {}

	def load_config(self):
		"""Loads default color scheme for html chat page """
		tree = etree.parse(settings.BASE_DIR + '/chat/DefaultScheme.xml')
		root = tree.getroot().find('colors')
		for child in root:
			self.colors[child.tag] = child.text

	def ready(self):
		self.load_config()

