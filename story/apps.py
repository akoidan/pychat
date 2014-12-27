__author__ = 'andrew'
from django.apps import AppConfig
from xml.dom import minidom
from Chat.settings import BASE_DIR

class DefaultSettingsConfig(AppConfig):
	name = 'story'
	verbose_name = "djangochat"

	def ready(self):
		xmldoc = minidom.parse(BASE_DIR + '/story/DefaultScheme.xml')
		itemlist = xmldoc.getElementsByTagName('colors')
		# print (itemlist[0].attributes['self_text_color'].value)

