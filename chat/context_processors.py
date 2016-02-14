__author__ = 'andrew'

from chat.settings import API_PORT
from chat.settings import VALIDATION_IS_OK


def add_user_name(request):
	"""
	GET only, returns main chat page.
	Login or logout navbar is creates by means of create_nav_page
	"""
	domain_address = request.get_host().split(':')[0]
	api_address = "ws://%s:%s/" % (domain_address, API_PORT)
	return {
		'apiUrl': api_address,
		'successReponse': VALIDATION_IS_OK,
		'username': request.user.username if request.user.is_authenticated() else ''
	}