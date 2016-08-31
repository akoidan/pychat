__author__ = 'andrew'

from chat.settings import VALIDATION_IS_OK, API_ADDRESS_PATTERN, JS_CONSOLE_LOGS


def add_user_name(request):
	"""
	Adds commons template variables
	tornado url, authorized, username, success constant
	"""
	return {
		# "wss://%s:PORT/" % domain
		'apiUrl': API_ADDRESS_PATTERN % request.get_host().split(':')[0],
		'successResponse': VALIDATION_IS_OK,
		'username': request.user.username if request.user.is_authenticated() else '',
		'userid': request.user.id if request.user.is_authenticated() else 0,
		'logs': request.user.userprofile.logs if request.user.is_authenticated() else JS_CONSOLE_LOGS
	}
