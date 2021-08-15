import json
import time
from urllib.request import urlopen
from chat import settings
from chat.models import IpAddress
from django.db.models import Q
api_url = getattr(settings, "IP_API_URL", "http://ip-api.com/json/%s")

__author__ = 'andrew'
from django.core.management import BaseCommand


class Command(BaseCommand):
	help = 'fills chat_ip_address.country_code'

	def handle(self, *args, **options):
		# Q(country__isnull=True) | Q(lat__isnull=True)
		for ip in IpAddress.objects.all():
			try:
				f = urlopen(api_url % ip.ip)
				raw_response = f.read().decode("utf-8")
				response = json.loads(raw_response)
				if response['status'] != "success":
					raise Exception(response['status'])
				ip.country_code = response['countryCode']
				ip.isp = response['isp']
				ip.country = response['country']
				ip.region = response['regionName']
				ip.city = response['city']
				ip.country_code = response['countryCode']
				ip.lat = response['lat']
				ip.lon = response['lon']
				ip.timezone = response['timezone']
				ip.zip = response['zip']

				ip.save()
				print("Saved %s" % raw_response)
				time.sleep(5)  # do not get banned
			except Exception as e:
				print("Skip %s because %s" % (ip, e))
