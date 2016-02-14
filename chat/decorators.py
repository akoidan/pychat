from django.core.exceptions import PermissionDenied
from django.http import HttpRequest


def login_required_no_redirect(f):
	def wrap(*args, **kwargs):
		# handle self
		request = args[0] if isinstance(args[0], HttpRequest) else args[1]
		if request.user.is_authenticated():
			return f(*args, **kwargs)
		else:
			raise PermissionDenied

	wrap.__doc__ = f.__doc__
	wrap.__name__ = f.__name__
	return wrap