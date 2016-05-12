from django.core.exceptions import PermissionDenied
from django.http import HttpRequest
from django.shortcuts import redirect


def login_required_no_redirect(do_redirect=None):
	"""
	@param do_redirect: throws exception on None, redirects to login on True, redirects to register of False
	@type do_redirect: bool
	"""
	def method_wrapper(f):
		def wrap(*args, **kwargs):
			# handle self
			request = args[0] if isinstance(args[0], HttpRequest) else args[1]
			if request.user.is_authenticated():
				return f(*args, **kwargs)
			else:
				if do_redirect is None:
					raise PermissionDenied
				else:
					type_arg = "login" if do_redirect else "register"
					return redirect('/register?type={}&next={}'.format(type_arg, request.path))

		wrap.__doc__ = f.__doc__
		wrap.__name__ = f.__name__
		return wrap
	return method_wrapper