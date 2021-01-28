import json
from chat.py2_3 import urlopen

from chat import settings
from chat.models import IpAddress

api_url = getattr(settings, "IP_API_URL", "http://ip-api.com/json/%s")

__author__ = 'andrew'
from django.core.management import BaseCommand


class Command(BaseCommand):
	help = 'fills chat_ip_address.country_code'

	def handle(self, *args, **options):
		for ip in IpAddress.objects.filter(country__isnull=True):
			try:
				f = urlopen(api_url % ip.ip)
				raw_response = f.read().decode("utf-8")
				response = json.loads(raw_response)
				if response['status'] != "success":
					raise Exception(response['status'])
				ip.country_code = response['countryCode']
				ip.isp = response['isp'],
				ip.country = response['country'],
				ip.region = response['regionName'],
				ip.city = response['city'],
				ip.country_code = response['countryCode']
				ip.save()
				print("Saved %s", raw_response)
			except Exception as e:
				print("Skip %s because %s" % (ip, e))
