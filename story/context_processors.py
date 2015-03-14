__author__ = 'andrew'

def create_nav_page(request):
	"""
	GET only, returns main Chat page.
	Login or logout navbar is creates by means of create_nav_page
	"""
	c = {}
	if request.user.is_authenticated():
		page = 'story/logout.html'
		c.update({'username': request.user.username})
	else:
		page = 'story/login.html'
	c.update({'navbar_page': page})
	return c