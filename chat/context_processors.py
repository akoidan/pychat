__author__ = 'andrew'
from django.conf import settings


def add_user_name(request):
	"""
	Adds commons template variables
	tornado url, authorized, username, success constant
	"""
	return {
		# "wss://%s:PORT/" % domain
		'apiUrl': settings.API_ADDRESS_PATTERN % request.get_host().split(':')[0],
		'successResponse': settings.VALIDATION_IS_OK,
		'username': request.user.username if request.user.is_authenticated() else '',
		'userid': request.user.id if request.user.is_authenticated() else 0,
		'theme': 'color-reg',
		'logs': request.user.userprofile.logs if request.user.is_authenticated() else settings.JS_CONSOLE_LOGS
	}
