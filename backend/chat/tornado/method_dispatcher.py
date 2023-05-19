# -*- encoding: utf-8 -*-
import json
import logging
import os
import urllib
from types import GeneratorType
import os.path
import tornado.web
import tornado.web
import tornado.web
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.files import File
from django.core.files.base import ContentFile
from tornado import gen
from tornado.httpclient import HTTPRequest

from chat import settings
from chat.global_redis import sync_redis
from chat.models import get_random_path
import mimetypes
from chat.utils import http_client, create_id


def add_missing_fields(*fields):
	"""
	@param do_redirect: throws exception on None, redirects to login on True, redirects to register of False
	@type do_redirect: bool
	"""
	def method_wrapper(f):
		def wrap(*args, **kwargs):
				for k in fields:
					if k not in kwargs:
						kwargs[k] = None
				return f(*args, **kwargs)
		wrap.__doc__ = f.__doc__
		wrap.__name__ = f.__name__
		return wrap
	return method_wrapper


def check_captcha(field='g-recaptcha-response'):
	"""
	:type request: WSGIRequest
	:raises ValidationError: if captcha is not valid or not set
	If RECAPTCHA_PRIVATE_KEY is enabled in settings validates request with it
	"""

	def method_wrapper(f):
		def wrap(self, *args, **kwargs):
			if hasattr(settings, 'RECAPTCHA_PRIVATE_KEY'):
				if not kwargs.get(field):
					raise ValidationError("Captcha is missing")
				try:
					self.logger.debug('Validating captcha...')
					response_object = yield http_client.fetch(HTTPRequest(
						"https://www.google.com/recaptcha/api/siteverify",
						method='POST',
						body=urllib.parse.urlencode({
							'secret': settings.RECAPTCHA_PRIVATE_KEY,
							'response': kwargs[field],
							'remoteip': self.client_ip
						})
					))
					response = json.loads(response_object.body)
					if not response.get('success', False):
						self.logger.debug('Captcha is NOT valid, response: %s', response_object.body)
						raise ValidationError(
							response['error-codes'] if response.get('error-codes', None) else 'This captcha already used')
					self.logger.debug('Captcha is valid, response: %s', response_object.body)
				except Exception as e:
					raise ValidationError('Unable to check captcha because {}'.format(e))
			else:
				self.logger.debug('Skipping captcha validation')
			kwargs.pop(field, None)
			result =  f(self, *args, **kwargs)
			if isinstance(result, GeneratorType):
				result = yield from result
			return result

		wrap.__doc__ = f.__doc__
		wrap.__name__ = f.__name__
		return wrap

	return method_wrapper


def get_user_id(request):
	session_id = request.headers.get('session-id')
	if session_id is None:
		return None
	user_id_raw = sync_redis.hget('sessions', session_id)
	if user_id_raw is None:
		return None
	return int(user_id_raw)


def login_required_no_redirect(func):
	def wrapper(self, *a, **ka):
		self.user_id = get_user_id(self.request)
		self.logger = logging.LoggerAdapter(parent_logger, {
			'id': create_id(self.user_id, self.id),
			'ip': self.client_ip
		})
		if self.user_id is None:
			raise tornado.web.HTTPError(403, 'Missing or expired session-id header')
		return func(self, *a, **ka)
	return wrapper


def extract_nginx_files(fn):
	"""
	extracts files for nginx_upload_module
	or extracts files from tornado self.request
	"""

	def get_extension(content_type, filename):
		result = None
		extension = None
		if content_type:
			if filename:
				filename = os.path.basename(filename)
				__, extension = os.path.splitext(filename)
			extensions = mimetypes.guess_all_extensions(content_type)
			if extension in extensions or filename in extensions:
				result =  ''
			else:
				result = mimetypes.guess_extension(content_type)
		return result or ''

	def wrap(self, **kargs):
		result = {}
		if kargs:
			files = {}
			for (key, value) in kargs.items():
				if key.endswith('.name'):
					realkey = key[:-5]
					realvalue = 'name'
				elif key.endswith('.path'):
					realkey = key[:-5]
					realvalue = 'path'
				elif key.endswith('.content_type'):  # not used
					realkey = key[:-13]
					realvalue = 'type'
				else:
					raise ValidationError("invalid body")
				files.setdefault(realkey, {})
				files[realkey][realvalue] = value
			for symbol, data in files.items():  # nginx
				file_path = get_random_path(None, data['name'])
				file_path += get_extension(data['type'], data['name'])
				os.rename(data['path'], os.sep.join((settings.MEDIA_ROOT, file_path)))
				result[symbol] = file_path
		else:
			for request_file in self.request.files:
				target_file = self.request.files[request_file][0]
				name_with_ext = target_file['filename'] + get_extension(
					target_file['content_type'],
					target_file['filename']
				)
				result[request_file] = File(ContentFile(target_file['body']), name=name_with_ext)

		return fn(self,result)
	return wrap


def validation(func):
	def wrapper(self, *a, **ka):
		try:
			return func(self, *a, **ka)
		except ValidationError as e:
			return str(e.message)
	return wrapper


def delist_arguments(args):
	"""
	Takes a dictionary, 'args' and de-lists any single-item lists then
	returns the resulting dictionary.
	In other words, {'foo': ['bar']} would become {'foo': 'bar'}
	"""
	for arg, value in args.items():
			if len(value) == 1:
				args[arg] = value[0].decode("utf-8")
			else:
				raise Exception('TODO')
	return args


def json_request(function):
	"""
	Json.loads the body and passes and 1st arg
	"""
	def wrap_function(self, *args, **kwargs):
		data = json.loads(self.request.body)
		return function(self, **data)

	return wrap_function

def json_response(function):
	"""
	Json.dumps the result if it's not string
	"""
	def wrap_function(self, *args, **kwargs):
		result = function(self, *args, **kwargs)
		if not isinstance(result, str):
			result = json.dumps(result)
		self.finish(result)

	return wrap_function


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

parent_logger = logging.getLogger(__name__)
class MethodDispatcher(tornado.web.RequestHandler):
	"""
	Subclasss this to have all of your class's methods exposed to the web
	for both GET and POST requests.	Class methods that start with an
	underscore (_) will be ignored.
	"""

	@property
	def client_ip(self):
		return self.request.remote_ip


	def _dispatch(self):
		"""
		Load up the requested URL if it matches one of our own methods.
		Skip methods that start with an underscore (_).
		"""
		args = {}
		id, self.id = create_id()
		self.logger = logging.LoggerAdapter(parent_logger, {
			'id': id,
			'ip': self.client_ip
		})
		# Sanitize argument lists:
		if self.request.arguments:
			args = delist_arguments(self.request.arguments)
		# Special index method handler:
		path = self.request.uri.split('?')[0]
		method = path.split('/')[-1]
		if not method.startswith('_'):
			func = getattr(self, method, None)
			if func:
				try:
					result = func(**args)
					if isinstance(result, GeneratorType):
						result = yield from result
					if not isinstance(result, str):
						result = json.dumps(result)
					self.finish(result)
				except ValidationError as e:
					self.set_status(409)
					self.finish(str(e.message))
			else:
				raise tornado.web.HTTPError(404)
		else:
			raise tornado.web.HTTPError(404)

	@gen.coroutine
	def get(self):
		self.method = 'GET'
		dispatch = self._dispatch()
		if isinstance(dispatch, GeneratorType):
			yield from dispatch

	@gen.coroutine
	def post(self):
		self.method = 'POST'
		dispatch = self._dispatch()
		if isinstance(dispatch, GeneratorType):
			yield from dispatch

	def options(self):
		# no body
		self.set_status(204)
		self.finish()

	def set_default_headers(self):
		self.set_header("Access-Control-Allow-Origin", "*")
		self.set_header("Access-Control-Allow-Headers", "x-requested-with, session-id, Content-Type")
		self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
