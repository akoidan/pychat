import random

from chat import local


class UserCookieMiddleWare(object):
	"""
	Middleware to set user cookie
	If user is authenticated and there is no cookie, set the cookie,
	If the user is not authenticated and the cookie remains, delete it
	"""

	def process_response(self, request, response):
		# force create Session for annon
		if hasattr(request, 'session') and not request.session.session_key:
			request.session.save()
			request.session.modified = True
		return response

	def process_request(self, request):
		try:
			local.random
		except AttributeError:
			local.random = str(random.randint(0, 10000)).rjust(4, '0')
			local.user = str(getattr(request.user, 'username', '')).rjust(8, ' ')
			local.client_ip = self.get_client_ip(request)

	def get_client_ip(self, request):
		x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
		return x_forwarded_for.split(',')[-1].strip() if x_forwarded_for else request.META.get('REMOTE_ADDR')