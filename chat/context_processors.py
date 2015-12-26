__author__ = 'andrew'

from chat.settings import  API_PORT

def add_user_name(request):
	"""
	GET only, returns main chat page.
	Login or logout navbar is creates by means of create_nav_page
	"""
	domain_address = request.get_host().split(':')[0]
	api_address = "ws://%s:%s/" % (domain_address, API_PORT)
	c = {'apiUrl': api_address}
	if request.user.is_authenticated():
		c['username'] =request.user.username
	return c