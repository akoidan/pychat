__author__ = 'andrew'


def add_user_name(request):
	"""
	GET only, returns main chat page.
	Login or logout navbar is creates by means of create_nav_page
	"""
	c = {}
	if request.user.is_authenticated():
		c.update({'username': request.user.username})
	return c