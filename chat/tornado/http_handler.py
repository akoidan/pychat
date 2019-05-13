# -*- encoding: utf-8 -*-
import datetime
import json
import logging
import tornado.web
from django.conf import settings
from django.contrib.auth import authenticate, login as djangologin
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.core.files import File
from django.core.files.base import ContentFile
from django.core.mail import mail_admins
from django.db import transaction
from django.db.models import Count, Q
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.views.decorators.http import require_http_methods

from chat import settings
from chat import utils, global_redis
from chat.decorators import validation
from chat.global_redis import sync_redis
from chat.models import Issue, IssueDetails, IpAddress, UserProfile, Verification, Message, Subscription, \
	SubscriptionMessages, RoomUsers, Room, UploadedFile, User
from chat.socials import GoogleAuth, FacebookAuth
from chat.tornado.constants import RedisPrefix
from chat.tornado.message_creator import MessagesCreator
from chat.utils import check_user, check_password, check_email, send_sign_up_email, \
	create_user_model, check_captcha, send_reset_password_email, get_client_ip, get_or_create_ip, \
	send_password_changed, send_new_email_ver, get_message_images_videos, generate_session

logger = logging.getLogger(__name__)
RECAPTCHA_PUBLIC_KEY = getattr(settings, "RECAPTCHA_PUBLIC_KEY", None)
RECAPTHCA_SITE_URL = getattr(settings, "RECAPTHCA_SITE_URL", None)
GOOGLE_OAUTH_2_CLIENT_ID = getattr(settings, "GOOGLE_OAUTH_2_CLIENT_ID", None)
GOOGLE_OAUTH_2_JS_URL = getattr(settings, "GOOGLE_OAUTH_2_JS_URL", None)
FACEBOOK_APP_ID = getattr(settings, "FACEBOOK_APP_ID", None)
FACEBOOK_JS_URL = getattr(settings, "FACEBOOK_JS_URL", None)


logger = logging.getLogger(__name__)


from chat.tornado.method_dispatcher import MethodDispatcher, require_http_method, login_required_no_redirect, \
	add_missing_fields


class HttpHandler(MethodDispatcher):

	@require_http_methods('GET')
	def test(self):
		sync_redis.ping()
		self.write(settings.VALIDATION_IS_OK)

	@login_required_no_redirect
	@require_http_method('POST')
	def logout(self, registration_id):
		session_id = self.request.headers.get('session_id')
		sync_redis.hdel('sessions', session_id)
		if registration_id is not None:
			Subscription.objects.filter(registration_id=registration_id).delete()
		self.finish(settings.VALIDATION_IS_OK)

	@require_http_method('POST')
	@validation
	def auth(self, username, password):
		"""
		Logs in into system.
		"""
		user = authenticate(username=username, password=password)
		if user is None:
			raise ValidationError('login or password is wrong')
		self.finish(generate_session(user.id))

	@add_missing_fields('email', 'sex')
	@transaction.atomic
	@validation
	def register(self, username, password, email, sex):
		check_user(username)
		check_password(password)
		check_email(email)
		user_profile = UserProfile(username=username, email=email, sex_str=sex)
		user_profile.set_password(password)
		create_user_model(user_profile)
		# You must call authenticate before you can call login
		auth_user = authenticate(username=username, password=password)
		if email:
			send_sign_up_email(user_profile, self.request.headers.get('host'))  # TODO req context
		self.finish(generate_session(auth_user.id))

	@require_http_methods('GET')
	@validation
	def confirm_email(self, token):
		"""
		Accept the verification token sent to email
		"""
		logger.debug('Processing email confirm with token  %s', token)
		try:
			v = Verification.objects.get(token=token)
		except Verification.DoesNotExist:
			raise ValidationError('Unknown verification token')
		if v.type_enum not in (Verification.TypeChoices.register, Verification.TypeChoices.confirm_email):
			raise ValidationError('This is not confirm email token')
		if v.verified:
			raise ValidationError('This verification token already accepted')
		user = UserProfile.objects.get(id=v.user_id)
		if user.email_verification_id != v.id:
			raise ValidationError('Verification token expired because you generated another one')
		v.verified = True
		v.save(update_fields=['verified'])
		message = settings.VALIDATION_IS_OK
		logger.info('Email verification token %s has been accepted for user %s(id=%d)', token, user.username, user.id)
		response = {'message': message}
		self.finish(response)

	@require_http_methods('POST')
	def google_auth(self, token):
		self.oauth(token, GoogleAuth())

	@validation
	def oauth(self, token, handler):
		user_profile = handler.generate_user_profile(token)
		session = generate_session(user_profile.id)
		self.finish(session)

	@require_http_methods('POST')
	def facook_auth(self, token):
		self.oauth(token, FacebookAuth())

	@require_http_methods('POST')
	@validation
	def validate_user(self, username):
		"""
		Validates user during registration
		"""
		utils.check_user(username)
		# hardcoded ok check in register.js
		self.finish(settings.VALIDATION_IS_OK)

	@require_http_methods('POST')
	def register_fcb(self, registration_id, agent, is_mobile):
		ip = get_or_create_ip(get_client_ip(self.request), logger)
		Subscription.objects.update_or_create(
			registration_id=registration_id,
			defaults={
				'user_id': self.user_id,
				'inactive': False,
				'updated': datetime.datetime.now(),
				'agent': agent,
				'is_mobile': is_mobile == 'true',
				'ip': ip
			}
		)
		self.finish(settings.VALIDATION_IS_OK)

	@require_http_methods('GET')
	@transaction.atomic
	def get_firebase_playback(self):
		registration_id = self.request.headers('HTTP_AUTH')
		logger.debug('Firebase playback, id %s', registration_id)
		query_sub_message = SubscriptionMessages.objects.filter(subscription__registration_id=registration_id,
																				  received=False).order_by('-message__time')[:1]
		sub_message = query_sub_message[0]
		SubscriptionMessages.objects.filter(id=sub_message.id).update(received=True)
		message = Message.objects.select_related("sender__username", "room__name").get(id=sub_message.message_id)
		data = {
			'title': message.sender.username,
			'options': {
				'body': message.content,
				'icon': '/favicon.ico',
				'data': {
					'id': sub_message.message_id,
					'sender': message.sender.username,
					'room': message.room.name,
					'roomId': message.room_id
				},
				'requireInteraction': True
			},
		}
		self.finish(json.dumps(data))

	@login_required_no_redirect
	@validation
	def change_password(self):
		passwd = self.get_argument('password')
		old_password = self.get_argument('old_password')
		user = User.objects.get(id=self.user_id)
		if user.password:
			is_valid = authenticate(username=user.username, password=old_password)
			if not is_valid:
				raise ValidationError("Invalid old password")
		utils.check_password(passwd)
		hash_pass = make_password(passwd)
		User.objects.filter(id=user.id).update(
			password=hash_pass
		)
		send_password_changed(self.request, user.email)
		self.finish(settings.VALIDATION_IS_OK)

	@transaction.atomic
	@validation
	def accept_token(self):
		"""
		Sends email verification token
		"""
		token = self.get_argument('token', False)
		logger.debug('Proceed Recover password with token %s', token)
		user, verification = utils.get_user_by_code(token, Verification.TypeChoices.password)
		password = self.get_argument('password')
		check_password(password)
		user.set_password(password)
		user.save(update_fields=('password',))
		verification.verified = True
		verification.save(update_fields=('verified',))
		logger.info('Password has been change for token %s user %s(id=%d)', token, user.username, user.id)
		self.finish(settings.VALIDATION_IS_OK)

	@require_http_methods('POST')
	def verify_token(self):
		token = self.get_argument('token', False)
		try:
			logger.debug('Rendering restore password page with token  %s', token)
			user = utils.get_user_by_code(token, Verification.TypeChoices.password)[0]
			self.finish(json.dumps({
				'message': settings.VALIDATION_IS_OK,
				'restoreUser': user.username
			}))
		except ValidationError as e:
			self.finish(json.dumps({
				'message': e.message,
			}))

	@require_http_method('GET')
	def change_email(self):
		try:
			with transaction.atomic():
				token = self.get_argument('token')
				logger.debug('Proceed change email with token %s', token)
				user, verification = utils.get_user_by_code(token, Verification.TypeChoices.email)
				new_ver = send_new_email_ver(self.request, user, verification.email)
				user.email = verification.email
				user.email_verification = new_ver
				user.save(update_fields=('email', 'email_verification'))
				verification.verified = True
				verification.save(update_fields=('verified',))
				logger.info('Email has been change for token %s user %s(id=%d)', token, user.username, user.id)
				return render_to_response(
					'email_changed.html',
					{'text': 'Your email has been changed to {}.'.format(verification.email)},
					context_instance=RequestContext(self.request)
				)
		except Exception as e:
			return render_to_response(
				'email_changed.html',
				{'text': 'Unable to change your email because {}'.format(e.message)}
				, context_instance=RequestContext(self.request)
			)

	@require_http_method('POST')
	def send_restore_password(self):
		try:
			username_or_password = self.get_argument('username_or_password')
			check_captcha(self.request)
			user_profile = UserProfile.objects.get(Q(username=username_or_password) | Q(email=username_or_password))
			if not user_profile.email:
				raise ValidationError("You didn't specify email address for this user")
			verification = Verification(type_enum=Verification.TypeChoices.password, user_id=user_profile.id)
			verification.save()
			try:
				send_reset_password_email(self.request, user_profile, verification)
			except Exception as e:
				raise ValidationError('Unable to send email: ' + str(e))
			message = settings.VALIDATION_IS_OK
			logger.debug('Verification email has been send for token %s to user %s(id=%d)',
							 verification.token, user_profile.username, user_profile.id)
		except UserProfile.DoesNotExist:
			message = "User with this email or username doesn't exist"
			logger.debug("Skipping password recovery request for nonexisting user")
		except (UserProfile.DoesNotExist, ValidationError) as e:
			logger.debug('Not sending verification email because %s', e)
			message = 'Unfortunately we were not able to send you restore password email because {}'.format(e)
		self.finish(message)

	@require_http_method('POST')
	@validation
	def validate_email(self, email):
		"""
		POST only, validates email during registration
		"""
		utils.check_email(email)
		self.finish(settings.VALIDATION_IS_OK)

	@require_http_methods('GET')
	def profile(self):
		try:
			user_profile = UserProfile.objects.get(pk=self.get_argument('id'))
			profile = MessagesCreator.get_user_profile(user_profile)
			profile['image'] = user_profile.photo.url if user_profile.photo.url else None
			self.finish(json.dumps(profile))
		except ObjectDoesNotExist:
			raise tornado.web.HTTPError(404)

	@transaction.atomic
	@login_required_no_redirect
	@require_http_methods('POST')
	def report_issue(self):
		issue_text = self.get_argument('issue')
		issue = Issue.objects.get_or_create(content=issue_text)[0]
		issue_details = IssueDetails(
			sender_id=self.user_id,
			browser=self.get_argument('browser'),
			issue=issue,
			log=self.get_argument('log')
		)
		try:
			mail_admins("{} reported issue".format(User.objects.get(id = self.user_id).username), issue_text, fail_silently=True)
		except Exception as e:
			logging.error("Failed to send issue email because {}".format(e))
		issue_details.save()
		self.finish(settings.VALIDATION_IS_OK)

	@require_http_method('POST')
	@login_required_no_redirect
	@validation
	def upload_profile_image(self):
		"""
		POST only, validates email during registration
		"""

		up = UserProfile(photo=File(ContentFile(self.request.files['file'][0]['body']), name=self.request.files['file'][0]['filename']), id=self.user_id)
		up.save(update_fields=('photo',))
		url = up.photo.url
		message = json.dumps(MessagesCreator.set_profile_image(url))
		channel = RedisPrefix.generate_user(self.user_id)
		global_redis.sync_redis.publish(channel, message)
		self.finish(settings.VALIDATION_IS_OK)

	@require_http_methods('GET')
	def statistics(self):
		pie_data = IpAddress.objects.values('country').filter(country__isnull=False).annotate(count=Count("country"))
		self.finish(json.dumps(list(pie_data)))

	@require_http_methods('POST')
	@login_required_no_redirect
	@validation
	def search_messages(self, data, room, offset):
		offset = int(offset)
		if not RoomUsers.objects.filter(room_id=room, user_id=self.user_id).exists():
			raise ValidationError("You can't access this room")
		messages = Message.objects.filter(content__icontains=data, room_id=room).order_by('-id')[
					  offset:offset + settings.MESSAGES_PER_SEARCH]
		imv = get_message_images_videos(messages)
		result = []
		for message in messages:
			files = MessagesCreator.prepare_img_video(imv, message.id)
			prep_m = MessagesCreator.create_message(message, files)
			result.append(prep_m)
		response = json.dumps(result)
		self.finish(response)

	@require_http_method('POST')
	@login_required_no_redirect
	@transaction.atomic
	@validation
	def save_room_settings(self):

		"""
		POST only, validates email during registration
		"""
		room_id = self.get_argument('roomId')
		room_name = self.get_argument('roomName')
		updated = RoomUsers.objects.filter(room_id=room_id, user_id=self.user_id).update(
			volume=self.get_argument('volume'),
			notifications=self.get_argument('notifications') == 'true',
		)
		if updated != 1:
			raise ValidationError("You don't have access to this room")
		if room_name is not None:
			room_name = room_name.strip()
			if room_name and int(room_id) != settings.ALL_ROOM_ID:
				Room.objects.filter(id=room_id).update(name=room_name)
		self.finish(settings.VALIDATION_IS_OK)

	@require_http_method('POST')
	@login_required_no_redirect
	@transaction.atomic
	def upload_file(self):

		"""
		POST only, validates email during registration
		"""
		res = []
		for file in self.request.files:
			uf = UploadedFile(symbol=file[1], user_id=self.user_id, file=self.request.files[file],
									type_enum=UploadedFile.UploadedFileChoices(file[0]))
			uf.save()
			res.append(uf.id)
		self.finish(json.dumps(res))
