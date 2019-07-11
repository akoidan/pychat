import json
import re

from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from oauth2client import client
from oauth2client.crypt import AppIdentityError
from tornado import httpclient
from tornado.httpclient import HTTPRequest
from tornado.httputil import url_concat

from chat import settings
from chat.log_filters import id_generator
from chat.models import UserProfile, get_random_path, RoomUsers
from chat.py2_3 import urlopen
from chat.utils import check_user

GOOGLE_OAUTH_2_CLIENT_ID = getattr(settings, "GOOGLE_OAUTH_2_CLIENT_ID", None)
FACEBOOK_ACCESS_TOKEN = getattr(settings, "FACEBOOK_ACCESS_TOKEN", None)


http_client = httpclient.HTTPClient()

class SocialAuth():

	def __init__(self, logger):
		self.logger = logger

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
				self.logger.error("Unable to download photo from url %s for user %s because %s",
						url, user_profile.username, e)

	def create_user_profile(self, email, name, surname, picture):
		try:
			user_profile = UserProfile.objects.get(email=email)
			self.logger.info("Sign in as %s with id %s", user_profile.username, user_profile.id)
		except UserProfile.DoesNotExist:
			try:
				self.logger.info(
					"Creating new user with email %s, name %s, surname %s, picture %s",
					email, name, surname, picture
				)
				# replace all characters but a valid one with '-' and cut to 15 chars
				username = re.sub('[^0-9a-zA-Z-_]+', '-', email.rsplit('@')[0])[:15]
				check_user(username)
			except ValidationError as e:
				self.logger.info("Can't use username %s because %s", username, e)
				username = id_generator(8)
			self.logger.debug("Generated username: %s", username)
			user_profile = UserProfile(
				name=name,
				surname=surname,
				email=email,
				username=username
			)
			self.download_http_photo(picture, user_profile)
			user_profile.save()
			RoomUsers(user_id=user_profile.id, room_id=settings.ALL_ROOM_ID, notifications=False).save()
		return user_profile


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

		r = http_client.fetch(HTTPRequest(url_concat(
			'https://graph.facebook.com/debug_token',
			{'input_token': token, 'access_token': FACEBOOK_ACCESS_TOKEN}
		)))
		response = json.loads(r.body)
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
		return user_id

	def get_facebook_user(self, user_id):
		r = http_client.fetch(HTTPRequest(url_concat(
			"https://graph.facebook.com/{}".format(user_id),
			self.PARAMS
		)))
		user_info = json.loads(r.body)
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
