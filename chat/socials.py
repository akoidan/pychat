import logging
import re

import requests
from django.contrib.auth import login as djangologin
from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from django.http import HttpResponse
from django.views.generic import View
from oauth2client import client
from oauth2client.crypt import AppIdentityError

from chat import settings
from chat.log_filters import id_generator
from chat.models import UserProfile, get_random_path
from chat.py2_3 import urlopen
from chat.settings import VALIDATION_IS_OK, AUTHENTICATION_BACKENDS
from chat.utils import create_user_model, check_user

GOOGLE_OAUTH_2_CLIENT_ID = getattr(settings, "GOOGLE_OAUTH_2_CLIENT_ID", None)
GOOGLE_OAUTH_2_HOST = getattr(settings, "GOOGLE_OAUTH_2_HOST", None)
FACEBOOK_ACCESS_TOKEN = getattr(settings, "FACEBOOK_ACCESS_TOKEN", None)

logger = logging.getLogger(__name__)


class SocialAuth(View):

	@property
	def app_token(self):
		raise NotImplemented

	@property
	def instance(self):
		raise NotImplemented

	def generate_user_profile(self, token):
		raise NotImplemented

	def download_http_photo(self, url, user_profile):
		if url is not None:
			try:
				response = urlopen(url)
				filename = get_random_path(None, url.split('/')[-1])
				content = ContentFile(response.read())
				user_profile.photo.save(filename, content, False)
			except Exception as e:
				logger.error("Unable to download photo from url %s for user %s because %s",
						url, user_profile.username, e)

	def create_user_profile(self, email, name, surname, picture):
		try:
			user_profile = UserProfile.objects.get(email=email)
			logger.info("Sign in as %s with id %s", user_profile.username, user_profile.id)
		except UserProfile.DoesNotExist:
			try:
				logger.info(
					"Creating new user with email %s, name %s, surname %s, picture %s",
					email, name, surname, picture
				)
				# replace all characters but a valid one with '-' and cut to 15 chars
				username = re.sub('[^0-9a-zA-Z-_]+', '-', email.rsplit('@')[0])[:15]
				check_user(username)
			except ValidationError as e:
				logger.info("Can't use username %s because %s", username, e)
				username = id_generator(8)
			logger.debug("Generated username: %s", username)
			user_profile = UserProfile(
				name=name,
				surname=surname,
				email=email,
				username=username
			)
			self.download_http_photo(picture, user_profile)
			user_profile.save()
			create_user_model(user_profile)
		return user_profile

	def post(self, request):
		try:
			rp = request.POST
			logger.info('Got %s request: %s', self.instance, rp)
			token = rp.get('token')
			user_profile = self.generate_user_profile(token)
			user_profile.backend = AUTHENTICATION_BACKENDS[0]
			djangologin(request, user_profile)
			request.session.save()

			return HttpResponse(content=request.session.session_key, content_type='text/plain')
		except ValidationError as e:
			logger.warn("Unable to proceed %s sing in because %s", self.instance, e.message)
			return HttpResponse(content="Unable to sign in via {} because '{}'".format(self.instance, e.message), content_type='text/plain')


class GoogleAuth(SocialAuth):

	@property
	def app_token(self):
		if GOOGLE_OAUTH_2_CLIENT_ID is None:
			raise ValidationError("GOOGLE_OAUTH_2_CLIENT_ID is not specified")
		return GOOGLE_OAUTH_2_CLIENT_ID

	@property
	def instance(self):
		return 'google'

	def verify_google_token(self, token):
		try:
			response = client.verify_id_token(token, None)
			if response['aud'] != self.app_token:
				raise ValidationError("Unrecognized client.")
			if response['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
				raise ValidationError("Wrong issuer.")
			if response['email'] is None:
				raise ValidationError("Google didn't provide an email")
			return response
		except AppIdentityError as e:
			raise ValidationError(e)

	def generate_user_profile(self, token):
		response = self.verify_google_token(token)
		return self.create_user_profile(
			response['email'],
			response.get('given_name'),
			response.get('family_name'),
			response.get('picture')
		)


class FacebookAuth(SocialAuth):

	@property
	def instance(self):
		return 'facebook'

	PARAMS = {
		'access_token': FACEBOOK_ACCESS_TOKEN,
		'fields': ",".join(('email', 'first_name', 'last_name'))
	}

	def get_facebook_user_id(self, token):
		r = requests.get(
			'https://graph.facebook.com/debug_token',
			{'input_token': token, 'access_token': FACEBOOK_ACCESS_TOKEN}
		)
		response = r.json()
		data = response.get('data')
		if data is None:
			raise ValidationError("response data is missing")
		if not data['is_valid']:
			error = data.get('error')
			if error is not None:
				raise ValidationError("Unable to verify token because '{} (code {}')".format(error.get('message'), error.get('code')))
			else:
				raise ValidationError("Unexpected error while verifying token")
		user_id = data.get('user_id')
		if user_id is None:
			raise ValidationError("Unable to login because data[user_id] is absent")
		return data.get('user_id')

	def get_facebook_user(self, user_id):
		url = "https://graph.facebook.com/{}".format(user_id)
		user_info = requests.get(url, self.PARAMS).json()
		if user_info.get('email') is None:
			raise ValidationError("Email for this user not found")
		return user_info

	def generate_user_profile(self, token):
		if FACEBOOK_ACCESS_TOKEN is None:
			raise ValidationError("FACEBOOK_ACCESS_TOKEN is not specified")
		user_id = self.get_facebook_user_id(token)
		user_info = self.get_facebook_user(user_id)
		return self.create_user_profile(
			user_info['email'],
			user_info.get('first_name'),
			user_info.get('last_name'),
			None
		)