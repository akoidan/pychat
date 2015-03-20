from django.contrib.auth.decorators import user_passes_test
from django.core.exceptions import PermissionDenied


def login_required_no_redirect(f):
	def wrap(request, *args, **kwargs):
		if request.user.is_authenticated():
			return f(request, *args, **kwargs)
		else:
			raise PermissionDenied

	wrap.__doc__ = f.__doc__
	wrap.__name__ = f.__name__
	return wrap