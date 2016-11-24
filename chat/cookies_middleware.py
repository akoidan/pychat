import random

from chat import local
from chat.log_filters import id_generator
from chat.settings import WS_ID_CHAR_LENGTH
from chat.utils import get_client_ip


def create_id(user_id, random=None):
	if user_id is None:
		user_id = 0
	if not random or len(random) != WS_ID_CHAR_LENGTH:
		random = id_generator(WS_ID_CHAR_LENGTH)
	return "{:04d}:{}".format(user_id, random)


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
			local.random = create_id(getattr(request.user, 'id'))
			local.client_ip = get_client_ip(request)
