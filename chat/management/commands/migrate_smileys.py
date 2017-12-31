from django.core.management.base import BaseCommand

from chat.models import Message
from chat.settings import WEBRTC_CONNECTION


class Command(BaseCommand):

	def __init__(self):
		super(Command, self).__init__()
	help = 'Migrates info.json'

	def handle(self, *args, **options):
		import json

		with open('/home/andrew/python/djangochat/trash/a.json') as old_file:
			data_old = json.load(old_file)

		with open('/home/andrew/python/djangochat/chat/static/smileys/info.json') as new_file:
			data_new = json.load(new_file)

		def find_old_entry(alt):
			for k in data_old:
				for smile in data_old[k]:
					if data_old[k][smile]['text_alt'] == alt:
						return smile
			raise Exception("Not {} found")

		output = {}

		for k in data_new:
			for smile in data_new[k]:
				entry = find_old_entry(smile['alt'])
				output[json.dumps(entry)] = smile['code']
		messages = Message.objects.all()
		for mess in messages:
			output_content = ""
			for char in mess.content:
				get = output.get(json.dumps(char))
				if get is not None:
					output_content += get
				else:
					output_content += char
			if mess.content != output_content:
				mess.content = output_content
				mess.save(update_fields=["content"])
				print("Updating " + str(mess.id))
