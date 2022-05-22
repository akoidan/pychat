# -*- encoding: utf-8 -*-
import datetime
import json
import re
from concurrent.futures import ThreadPoolExecutor

import tornado.web
from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.core.mail import mail_admins, send_mail
from django.core.validators import validate_email
from django.db.models import Count, Q
from django.db.utils import OperationalError
from django.template.loader import render_to_string
from django.utils.safestring import mark_safe
from django.utils.timezone import utc
from redis import ConnectionError
from tornado import ioloop
from tornado.concurrent import run_on_executor

from chat import settings
from chat import utils, global_redis
from chat.global_redis import sync_redis
from chat.log_filters import id_generator
from chat.models import Issue, IssueDetails, IpAddress, UserProfile, Verification, Message, Subscription, \
	SubscriptionMessages, RoomUsers, Room, UploadedFile, User
from chat.settings_base import ALL_ROOM_ID
from chat.socials import GoogleAuth, FacebookAuth
from chat.tornado.constants import Actions, RedisPrefix, VarNames, HandlerNames
from chat.tornado.message_creator import MessagesCreator
from chat.tornado.method_dispatcher import MethodDispatcher, require_http_method, login_required_no_redirect, \
	add_missing_fields, extract_nginx_files, check_captcha, get_user_id, json_response, json_request
from chat.utils import check_user, is_blank, get_or_create_ip_model, create_thumbnail, get_thumbnail_url

SERVER_ADDRESS = getattr(settings, "SERVER_ADDRESS", None)

if not SERVER_ADDRESS:
	print("!!!!\nPLEASE SET SERVER_ADDRESS in settings.py\n!!!!")

class HttpHandler(MethodDispatcher):

	executor = ThreadPoolExecutor(max_workers=settings.CONCURRENT_THREAD_WORKERS)

	def __init__(self, application, request, **kwargs):
		self.io_loop = ioloop.IOLoop.current()
		self.user_id = None
		super(HttpHandler, self).__init__(application, request, **kwargs)

	def __check_password(self, password):
		"""
		Checks if password is secure
		:raises ValidationError exception if password is not valid
		"""
		if is_blank(password):
			raise ValidationError("password can't be empty")
		if not re.match(u'^\S.+\S$', password):
			raise ValidationError("password should be at least 3 symbols")

	def __generate_session__(self, user_id):
		session = id_generator(32)
		sync_redis.hset('sessions', session, user_id)
		return session

	def __get_user_by_code(self, token, type):
		"""
		:param token: token code to verify
		:type token: str
		:raises ValidationError: if token is not usable
		:return: UserProfile, Verification: if token is usable
		"""
		try:
			v = Verification.objects.get(token=token)
			if v.type_enum != type:
				raise ValidationError("it's not for this operation ")
			if v.verified:
				raise ValidationError("it's already used")
			# TODO move to sql query or leave here?
			if v.time < datetime.datetime.utcnow().replace(tzinfo=utc) - datetime.timedelta(days=1):
				raise ValidationError("it's expired")
			return UserProfile.objects.get(id=v.user_id), v
		except Verification.DoesNotExist:
			raise ValidationError('Unknown verification token')

	@staticmethod
	def __check_email__(email):
		"""
		:raises ValidationError if specified email is registered or not valid
		"""
		if not email:
			return
		try:
			validate_email(email)
			# theoretically can throw returning 'more than 1' error
			UserProfile.objects.get(email=email)
			raise ValidationError('Email {} is already used'.format(email))
		except User.DoesNotExist:
			pass

	@property
	def __host(self):
		if SERVER_ADDRESS:
			return SERVER_ADDRESS
		else:
			self.logger.error("SERVER_ADDRESS is missing, this could lead to HOST header attacks")
			return '{}://{}'.format(self.request.protocol,self.request.host)

	@run_on_executor
	def __send_mail(self, subject, body_text, receiver, html_body, fail_silently):
		try:
			send_mail(
				subject=subject,
				message=body_text,
				from_email=settings.FROM_EMAIL,
				recipient_list=[receiver],
				fail_silently=fail_silently,
				html_message=html_body
			)
		except Exception as e:
			self.logger.error("Failed to send email %s to %s because %s", subject, receiver, e)
			raise e
		else:
			self.logger.info("Email %s has been sent to %s", subject, receiver)

	@run_on_executor
	def __mail_admins(self, *args, **kwargs):
		mail_admins(*args, **kwargs)

	def __send_sign_up_email(self, user):
		verification = Verification(user=user, type_enum=Verification.TypeChoices.register)
		verification.save()
		user.email_verification = verification
		user.save(update_fields=['email_verification'])
		link = "{}/#/confirm_email?token={}".format(self.__host, verification.token)
		text = ('Hi {}, you have registered pychat'
						'\nTo complete your registration please click on the url bellow: {}'
						'\n\nIf you find any bugs or propositions you can post them {}').format(
			user.username, link, settings.ISSUES_REPORT_LINK)
		start_message = mark_safe((
			"You have registered in <b>Pychat</b>. If you find any bugs or propositions you can post them"
			" <a href='{}'>here</a>. To complete your registration please click on the link below.").format(
			settings.ISSUES_REPORT_LINK))
		context = {
			'username': user.username,
			'magicLink': link,
			'btnText': "CONFIRM SIGN UP",
			'greetings': start_message
		}
		html_message = render_to_string('sign_up_email.html', context)
		self.logger.info('Sending verification email to userId %s (email %s)', user.id, user.email)
		yield self.__send_mail(
			"Confirm chat registration",
			text,
			user.email,
			html_message,
			True
		)

	def __send_password_changed(self, username, email):
		message = "Password has been changed for user {}".format(username)
		ip_info = yield from self.__get_or_create_ip()
		context = {
			'username': username,
			'ipInfo': ip_info.info,
			'ip': ip_info.ip,
			'timeCreated': datetime.datetime.now(),
		}
		html_message = render_to_string('change_password.html', context)
		yield self.__send_mail(
			"Pychat: password change",
			message,
			email,
			html_message,
			False
		)

	def __get_or_create_ip(self):
		return (yield from get_or_create_ip_model(self.client_ip, self.logger))

	def __send_reset_password_email(self, email, username, verification):
		link = "{}/#/auth/proceed-reset-password?token={}".format(self.__host, verification.token)
		message = "{},\n" \
							"You requested to change a password on site {}.\n" \
							"To proceed click on the link {}\n" \
							"If you didn't request the password change just ignore this mail" \
			.format(username, self.__host, link)
		ip_info = yield from self.__get_or_create_ip()
		start_message = mark_safe(
			"You have requested to send you a magic link to quickly restore password to <b>Pychat</b>. "
			"If it wasn't you, you can safely ignore this email")
		context = {
			'username': username,
			'magicLink': link,
			'ipInfo': ip_info.info,
			'ip': ip_info.ip,
			'btnText': "CHANGE PASSWORD",
			'timeCreated': verification.time,
			'greetings': start_message
		}
		html_message = render_to_string('token_email.html', context)
		yield self.__send_mail(
			"Pychat: restore password",
			message,
			email,
			html_message,
			False
		)

	def __send_new_email_ver(self, user, email):
		new_ver = Verification(user=user, type_enum=Verification.TypeChoices.confirm_email, email=email)
		new_ver.save()
		link = "{}/#/confirm_email?token={}".format(self.__host, new_ver.token)
		text = ('Hi {}, you have changed email to curren on pychat \nTo verify it, please click on the url: {}') \
			.format(user.username, link)
		start_message = mark_safe(
			"You have changed email to current one in  <b>Pychat</b>. \n"
			"To stay safe please verify it by clicking on the url below."
		)
		context = {
			'username': user.username,
			'magicLink': link,
			'btnText': "CONFIRM THIS EMAIL",
			'greetings': start_message
		}
		html_message = render_to_string('sign_up_email.html', context)
		self.logger.info('Sending verification email to userId %s (email %s)', user.id, email)
		yield self.__send_mail(
			"Confirm this email",
			text,
			email,
			html_message,
			False
		)
		return new_ver

	def __send_email_changed(self, old_email, new_email, username):
		message = "Mail been changed for user {}".format(username)
		ip_info = yield from self.__get_or_create_ip()
		context = {
			'username': username,
			'ipInfo': ip_info.info,
			'ip': ip_info.ip,
			'timeCreated': datetime.datetime.now(),
			'email': new_email,
		}
		html_message = render_to_string('change_email.html', context)
		yield self.__send_mail(
			"Pychat: email change",
			message,
			old_email,
			html_message,
			True
		)

	@require_http_method('GET')
	def health(self):
		try:
			Room.objects.get(id=settings.ALL_ROOM_ID)
		except OperationalError:
			raise ValidationError("mysql is down")
		try:
			sync_redis.ping()
		except ConnectionError:
			raise ValidationError("redis is down")
		return settings.VALIDATION_IS_OK

	@login_required_no_redirect
	@require_http_method('POST')
	def logout(self, registration_id):
		session_id = self.request.headers.get('session-id')
		sync_redis.hdel('sessions', session_id)
		if registration_id is not None:
			Subscription.objects.filter(registration_id=registration_id).delete()
		return settings.VALIDATION_IS_OK

	@require_http_method('POST')
	@check_captcha()
	def auth(self, username, password):
		"""
		Logs in into system.
		"""
		try:
			if '@' in username:
				user = UserProfile.objects.get(email=username)
			else:
				user = UserProfile.objects.get(username=username)
			if not user.check_password(password):
				raise ValidationError("Invalid password")
		except User.DoesNotExist:
			raise ValidationError("User {} doesn't exist".format(username))

		return MessagesCreator.get_session(self.__generate_session__(user.id))

	@add_missing_fields('email', 'sex')
	# @transaction.atomic TODO, is this works in single thread?
	def register(self, username, password, email, sex):
		check_user(username)
		self.__check_password(password)
		self.__check_email__(email)
		user_profile = UserProfile(username=username, email=email, sex_str=sex)
		user_profile.set_password(password)
		user_profile.save()
		RoomUsers(user_id=user_profile.id, room_id=settings.ALL_ROOM_ID, notifications=False).save()

		user_data = {
			VarNames.ROOMS: [{
				VarNames.ROOM_ID: settings.ALL_ROOM_ID,
				VarNames.ROOM_USERS: list(RoomUsers.objects.filter(room_id=ALL_ROOM_ID).values_list('user_id', flat=True))
			}],
			VarNames.EVENT: Actions.CREATE_NEW_USER,
			VarNames.HANDLER_NAME: HandlerNames.ROOM,
		}
		user_data.update(RedisPrefix.set_js_user_structure(
			user_profile.id,
			user_profile.username,
			user_profile.sex,
			None
		))
		global_redis.async_redis_publisher.publish(
			settings.ALL_ROOM_ID,
			json.dumps(user_data),
		)

		if email:
			yield from self.__send_sign_up_email(user_profile)
		return MessagesCreator.get_session(self.__generate_session__(user_profile.id))

	@require_http_method('GET')
	def confirm_email(self, token):
		"""
		Accept the verification token sent to email
		"""
		self.logger.debug('Processing email confirm with token  %s', token)
		try:
			v = Verification.objects.get(token=token)
		except Verification.DoesNotExist:
			raise ValidationError('Unknown verification token')
		if v.type_enum not in (Verification.TypeChoices.register, Verification.TypeChoices.confirm_email):
			raise ValidationError('This is not confirm email token')
		if v.verified:
			raise ValidationError('This verification token is already accepted')
		user = UserProfile.objects.get(id=v.user_id)
		if user.email_verification_id != v.id:
			raise ValidationError('Verification token expired because you generated another one')
		v.verified = True
		v.save(update_fields=['verified'])
		self.logger.info('Email verification token %s has been accepted for user %s(id=%d)', token, user.username, user.id)
		return settings.VALIDATION_IS_OK

	@require_http_method('POST')
	def google_auth(self, token):
		return (yield self.__oauth(token, GoogleAuth(self.logger)))

	@run_on_executor
	def __oauth(self, token, handler):
		user_profile, is_new = handler.generate_user_profile(token)
		return MessagesCreator.get_oauth_session(self.__generate_session__(user_profile.id), user_profile.username, is_new)

	@run_on_executor
	def __get_oauth_identifier(self, token, handler):
		return handler.get_oauth_identifier(token)

	@require_http_method('POST')
	def facebook_auth(self, token):
		return (yield self.__oauth(token, FacebookAuth(self.logger)))

	@require_http_method('POST')
	def validate_user(self, username):
		"""
		Validates user during registration
		"""
		utils.check_user(username)
		# hardcoded ok check in register.js
		return settings.VALIDATION_IS_OK

	@require_http_method('POST')
	@login_required_no_redirect
	@json_request
	def register_fcb(self, registration_id, agent, is_mobile):
		ip = yield from self.__get_or_create_ip()
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
		return settings.VALIDATION_IS_OK

	@require_http_method('GET')
	# @transaction.atomic TODO, is this works in single thread?
	def get_firebase_playback(self,registration_id):
		self.logger.debug('Firebase playback, id %s', registration_id)
		query_sub_message = SubscriptionMessages.objects.filter(
			subscription__registration_id=registration_id,
			received=False
		).order_by('-message__time')[:1]
		sub_message = query_sub_message[0]
		SubscriptionMessages.objects.filter(id=sub_message.id).update(received=True)
		message = Message.objects.values("sender__username", "sender__thumbnail", "room__name", "room_id", "content", "id").get(id=sub_message.message_id)
		thumbnail = get_thumbnail_url(message['sender__thumbnail'])
		data = {
			'title': message['sender__username'],
			'options': {
				'body': message['content'],
				'icon': thumbnail if thumbnail else '/favicon.ico',
				'data': {
					'id': message['id'],
					'sender': message['sender__username'],
					'room': message['room__name'],
					'roomId': message['room_id']
				},
				'requireInteraction': True
			},
		}
		return data

	@login_required_no_redirect
	def change_password(self, password, old_password):
		user = UserProfile.objects.get(id=self.user_id)
		if user.password and not user.check_password(old_password):
			raise ValidationError("Invalid old password")
		self.__check_password(password)
		hash_pass = make_password(password)
		User.objects.filter(id=user.id).update(
			password=hash_pass
		)
		if user.email is not None:
			yield from self.__send_password_changed(user.username, user.email)
		return settings.VALIDATION_IS_OK

	@login_required_no_redirect
	def oauth_status(self):
		user = UserProfile.objects.get(id=self.user_id)
		return {'google': user.google_id is not None, 'facebook': user.facebook_id is not None}


	@require_http_method('POST')
	@login_required_no_redirect
	def set_google_oauth(self, token):
		if token:
			google_token = yield self.__get_oauth_identifier(token, GoogleAuth(self.logger))
		else:
			google_token = None
		up = UserProfile.objects.get(id=self.user_id)
		up.google_id = google_token
		up.save()
		return settings.VALIDATION_IS_OK

	@require_http_method('POST')
	@login_required_no_redirect
	def set_facebook_oauth(self, token):
		if token:
			facebook_token = yield self.__get_oauth_identifier(token, FacebookAuth(self.logger))
		else:
			facebook_token = None
		up = UserProfile.objects.get(id=self.user_id)
		up.facebook_id = facebook_token
		up.save()
		return settings.VALIDATION_IS_OK

	# @transaction.atomic TODO, is this works in single thread?
	def accept_token(self, token, password):
		"""
		Sends email verification token
		"""
		self.logger.debug('Proceed Recover password with token %s', token)
		user, verification = self.__get_user_by_code(token, Verification.TypeChoices.password)
		self.__check_password(password)
		user.set_password(password)
		user.save(update_fields=('password',))
		verification.verified = True
		verification.save(update_fields=('verified',))
		self.logger.info('Password has been change for token %s user %s(id=%d)', token, user.username, user.id)
		return settings.VALIDATION_IS_OK

	@require_http_method('POST')
	def verify_token(self, token):
		try:
			self.logger.debug('Rendering restore password page with token  %s', token)
			user = self.__get_user_by_code(token, Verification.TypeChoices.password)[0]
			return {
				'message': settings.VALIDATION_IS_OK,
				'restoreUser': user.username
			}
		except ValidationError as e:
			return {
				'message': e.message,
			}

	@login_required_no_redirect
	def change_email_login(self, email, password):
		userprofile = UserProfile.objects.get(id=self.user_id)
		if not userprofile.check_password(password):
			raise ValidationError("Invalid password")
		if userprofile.email != email:
			self.__check_email__(email)
			if userprofile.email and userprofile.email_verification and userprofile.email_verification.verified:
				verification = Verification(
					type_enum=Verification.TypeChoices.email,
					user_id=self.user_id,
					email=email
				)
				verification.save()
			elif email:
				new_ver = yield from self.__send_new_email_ver(userprofile, email)
				UserProfile.objects.filter(id=self.user_id).update(email_verification_id=new_ver.id, email=email)
			yield from self.__send_email_changed(
				userprofile.email,
				email,
				userprofile.username
			)
		return settings.VALIDATION_IS_OK

	@require_http_method('GET')
	# @transaction.atomic TODO, is this works in single thread?
	def change_email(self, token):
		self.logger.debug('Proceed change email with token %s', token)
		user, verification = self.__get_user_by_code(token, Verification.TypeChoices.email)
		new_ver = yield from self.__send_new_email_ver(user, verification.email)
		user.email = verification.email
		user.email_verification = new_ver
		user.save(update_fields=('email', 'email_verification'))
		verification.verified = True
		verification.save(update_fields=('verified',))
		return settings.VALIDATION_IS_OK

	@require_http_method('POST')
	@check_captcha()
	def send_restore_password(self, username_or_password):
		try:
			user_profile = UserProfile.objects.get(Q(username=username_or_password) | Q(email=username_or_password))
			if not user_profile.email:
				raise ValidationError("You didn't specify email address for this user")
			verification = Verification(type_enum=Verification.TypeChoices.password, user_id=user_profile.id)
			verification.save()
			try:
				yield from self.__send_reset_password_email(user_profile.email, user_profile.username, verification)
			except Exception as e:
				raise ValidationError('Unable to send email: ' + str(e))
			message = settings.VALIDATION_IS_OK
			self.logger.debug(
				'Verification email has been send for token %s to user %s(id=%d)',
				verification.token,
				user_profile.username,
				user_profile.id
			)
		except UserProfile.DoesNotExist:
			message = "User with this email or username doesn't exist"
			self.logger.debug("Skipping password recovery request for nonexisting user")
		except (UserProfile.DoesNotExist, ValidationError) as e:
			self.logger.debug('Not sending verification email because %s', e)
			message = 'Unfortunately we were not able to send you restore password email because {}'.format(e)
		return message

	@require_http_method('POST')
	def validate_email(self, email):
		"""
		POST only, validates email during registration
		"""
		self.__check_email__(email)
		return settings.VALIDATION_IS_OK

	@require_http_method('GET')
	def profile(self, id):
		try:
			user_profile = UserProfile.objects.get(pk=id)
			profile = MessagesCreator.get_user_profile(user_profile)
			profile['image'] = user_profile.photo.url if user_profile.photo.name else None
			return profile
		except ObjectDoesNotExist:
			raise tornado.web.HTTPError(404)

	# @transaction.atomic TODO, is this works in single thread?
	@require_http_method('POST')
	def report_issue(self, issue, browser, version):
		user_id = get_user_id(self.request)
		issue_object = Issue.objects.get_or_create(content=issue)[0]
		issue_details = IssueDetails(
			sender_id=user_id,
			browser=browser,
			version=version,
			issue=issue_object
		)
		username = User.objects.get(id=user_id).username if user_id else None

		yield self.__mail_admins(
			"{} reported issue".format(username),
			issue,
			fail_silently=True
		)
		issue_details.save()
		return settings.VALIDATION_IS_OK

	@require_http_method('POST')
	@login_required_no_redirect
	@extract_nginx_files
	def upload_profile_image(self, files):
		"""
		POST only, validates email during registration
		"""
		input_file = files['file']
		up = UserProfile(photo=input_file, id=self.user_id)
		create_thumbnail(input_file, up)
		up.save(update_fields=('photo', 'thumbnail'))
		up = UserProfile.objects.values('sex', 'thumbnail', 'photo', 'username').get(id=self.user_id)
		payload = {
			VarNames.HANDLER_NAME: HandlerNames.WS,
			VarNames.EVENT: Actions.USER_PROFILE_CHANGED
		}
		payload.update(
			RedisPrefix.set_js_user_structure(
				self.user_id,
				up['username'],
				up['sex'],
				get_thumbnail_url(up['thumbnail']),
			)
		)
		global_redis.sync_redis.publish(settings.ALL_ROOM_ID, json.dumps(payload))
		global_redis.sync_redis.publish( RedisPrefix.generate_user(self.user_id), json.dumps({
			VarNames.HANDLER_NAME: HandlerNames.WS,
			VarNames.EVENT: Actions.SET_PROFILE_IMAGE,
			VarNames.CONTENT: get_thumbnail_url(up['photo']),
		}))
		return settings.VALIDATION_IS_OK

	@require_http_method('POST')
	@login_required_no_redirect
	@extract_nginx_files
	# @transaction.atomic TODO, is this works in single thread?
	def upload_file(self, files):
		"""
		POST only, validates email during registration
		"""
		ufs = {}
		for name, value in files.items():
			up = UploadedFile(
				symbol=name[1],
				user_id=self.user_id,
				file=value,
				type_enum=UploadedFile.UploadedFileChoices(name[0])
			)
			up.save()
			res = ufs.setdefault(name[1], {})
			if name[0] == 'p':
				res['previewFileId'] = up.id
			else:
				res['fileId'] = up.id
		return ufs
