import tornado.web

from chat.global_redis import sync_redis


def add_missing_fields(*fields):
	"""
	@param do_redirect: throws exception on None, redirects to login on True, redirects to register of False
	@type do_redirect: bool
	"""
	def method_wrapper(f):
		def wrap(*args, **kwargs):
				for k in fields:
					if not kwargs.has_key(k):
						kwargs[k] = None
				return f(*args, **kwargs)
		wrap.__doc__ = f.__doc__
		wrap.__name__ = f.__name__
		return wrap
	return method_wrapper


def login_required_no_redirect(func):
	def wrapper(self, *a, **ka):
		session_id = self.request.headers.get('session_id')
		if session_id is None:
			raise tornado.web.HTTPError(403, 'session_id header is missing')
		self.user_id = sync_redis.hget('sessions', session_id)
		if self.user_id is None:
			raise tornado.web.HTTPError(403, 'session {} is invalid'.format(session_id))
		return func(self, *a, **ka)
	return wrapper

def delist_arguments(args):
	"""
	Takes a dictionary, 'args' and de-lists any single-item lists then
	returns the resulting dictionary.
	In other words, {'foo': ['bar']} would become {'foo': 'bar'}
	"""
	for arg, value in args.items():
			if len(value) == 1:
				args[arg] = value[0]
	return args

class MethodDispatcher(tornado.web.RequestHandler):
	"""
	Subclasss this to have all of your class's methods exposed to the web
	for both GET and POST requests.	Class methods that start with an
	underscore (_) will be ignored.
	"""

	def _dispatch(self):
			"""
			Load up the requested URL if it matches one of our own methods.
			Skip methods that start with an underscore (_).
			"""
			args = None
			# Sanitize argument lists:
			if self.request.arguments:
				args = delist_arguments(self.request.arguments)
			# Special index method handler:
			if self.request.uri.endswith('/'):
				func = getattr(self, 'index', None)
				if args:
						return func(**args)
				else:
						return func()
			path = self.request.uri.split('?')[0]
			method = path.split('/')[-1]
			if not method.startswith('_'):
				func = getattr(self, method, None)
				if func:
						if args:
							return func(**args)
						else:
							return func()
				else:
						raise tornado.web.HTTPError(404)
			else:
				raise tornado.web.HTTPError(404)

	def get(self):
		self.method = 'GET'
		return self._dispatch()

	def post(self):
		self.method = 'POST'
		return self._dispatch()

	def options(self):
		# no body
		self.set_status(204)
		self.finish()


	def set_default_headers(self):
		self.set_header("Access-Control-Allow-Origin", "*")
		self.set_header("Access-Control-Allow-Headers", "x-requested-with")
		self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
		self.set_header('Access-Control-Allow-Headers', 'session_id')

def require_http_method(method):

	def method_wrapper(f):
		def wrap(self, *args, **kwargs):
			if (self.method ==  method):
				return f(self, *args, **kwargs)
			else:
				raise tornado.web.HTTPError(405)

		wrap.__doc__ = f.__doc__
		wrap.__name__ = f.__name__
		return wrap

	return method_wrapper
