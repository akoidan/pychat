from story.registration_utils import id_generator

from django.conf import settings
user_cookie_name = settings.USER_COOKIE_NAME
api_cookie_name = settings.WS_ADDRESS_COOKIE_NAME
api_port = settings.API_PORT


class UserCookieMiddleWare(object):
	"""
	Middleware to set user cookie
	If user is authenticated and there is no cookie, set the cookie,
	If the user is not authenticated and the cookie remains, delete it
	"""

	def process_response(self, request, response):
		if not request.COOKIES.get(user_cookie_name):
			if request.user.is_authenticated():
				response.set_cookie(user_cookie_name, request.user.username)
			else:
				response.set_cookie(user_cookie_name, id_generator(8))

		if not request.COOKIES.get(api_cookie_name):
			domain_address = request.get_host().split(':')[0]
			api_address = "ws://%s:%s/1/" % (domain_address, api_port)
			response.set_cookie(api_cookie_name, api_address)
		return response
