import random

from chat import local
from chat.utils import get_client_ip


class UserCookieMiddleWare(object):
	"""
	Middleware to set user cookie
	If user is authenticated and there is no cookie, set the cookie,
	If the user is not authenticated and the cookie remains, delete it
	"""

	def process_request(self, request):
		try:
			local.random
		except AttributeError:
			local.random = str(random.randint(0, pow(10,10))).rjust(10, '0')
			local.user_id = str(getattr(request.user, 'id', '000')).zfill(3)
			local.client_ip = get_client_ip(request)
