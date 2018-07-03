# -*- encoding: utf-8 -*-
import datetime
import json
import logging
import os

from django.contrib.auth import authenticate, SESSION_KEY, BACKEND_SESSION_KEY, HASH_SESSION_KEY
from django.contrib.auth import login as djangologin
from django.contrib.auth import logout as djangologout
from django.contrib.auth.hashers import make_password
from django.core.mail import mail_admins

from chat.templatetags.md5url import md5url
from chat.tornado.constants import RedisPrefix
from chat.tornado.message_creator import MessagesCreator

try:
	from django.template.context_processors import csrf
except ImportError:
	from django.core.context_processors import csrf
from django.core.exceptions import ObjectDoesNotExist, ValidationError, PermissionDenied
from django.db import transaction
from django.db.models import Count, Q
from django.http import Http404
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.views.decorators.http import require_http_methods
from django.views.generic import View
from chat import utils, global_redis
from chat.decorators import login_required_no_redirect, validation
from chat.forms import UserProfileForm, UserProfileReadOnlyForm
from chat.models import Issue, IssueDetails, IpAddress, UserProfile, Verification, Message, Subscription, \
	SubscriptionMessages, RoomUsers, Room, UserJoinedInfo, UploadedFile, User
from django.conf import settings
from chat.utils import hide_fields, check_user, check_password, check_email, extract_photo, send_sign_up_email, \
	create_user_model, check_captcha, send_reset_password_email, get_client_ip, get_or_create_ip, \
	send_password_changed, send_email_change, send_new_email_ver, get_message_images_videos

logger = logging.getLogger(__name__)
RECAPTCHA_PUBLIC_KEY = getattr(settings, "RECAPTCHA_PUBLIC_KEY", None)
RECAPTHCA_SITE_URL = getattr(settings, "RECAPTHCA_SITE_URL", None)
GOOGLE_OAUTH_2_CLIENT_ID = getattr(settings, "GOOGLE_OAUTH_2_CLIENT_ID", None)
GOOGLE_OAUTH_2_JS_URL = getattr(settings, "GOOGLE_OAUTH_2_JS_URL", None)
FACEBOOK_APP_ID = getattr(settings, "FACEBOOK_APP_ID", None)
FACEBOOK_JS_URL = getattr(settings, "FACEBOOK_JS_URL", None)


# TODO doesn't work
def handler404(request):
	return HttpResponse("Page not found", content_type='text/plain')


@require_http_methods(['POST'])
@validation
def validate_email(request):
	"""
	POST only, validates email during registration
	"""
	utils.check_email(request.POST.get('email'))
	return HttpResponse(settings.VALIDATION_IS_OK, content_type='text/plain')


@require_http_methods(['POST'])
@login_required_no_redirect()
@transaction.atomic
def upload_file(request):
	"""
	POST only, validates email during registration
	"""
	logger.debug('Uploading file %s', request.POST)
	res = []
	for file in request.FILES:
		uf = UploadedFile(symbol=file[1], user=request.user, file=request.FILES[file], type_enum=UploadedFile.UploadedFileChoices(file[0]))
		uf.save()
		res.append(uf.id)
	return HttpResponse(json.dumps(res), content_type='application/json')



@require_http_methods(['POST'])
@login_required_no_redirect()
@validation
def upload_profile_image(request):
	"""
	POST only, validates email during registration
	"""

	up = UserProfile(photo=request.FILES['file'], id=request.user.id)
	up.save(update_fields=('photo',))
	url = up.photo.url
	message = json.dumps(MessagesCreator.set_profile_image(url))
	channel = RedisPrefix.generate_user(request.user.id)
	global_redis.sync_redis.publish(channel, message)
	return HttpResponse(settings.VALIDATION_IS_OK, content_type='text/plain')

@require_http_methods(['POST'])
@login_required_no_redirect(False)
@transaction.atomic
@validation
def save_room_settings(request):
	"""
	POST only, validates email during registration
	"""
	logger.debug('save_room_settings request,  %s', request.POST)
	room_id = request.POST['roomId']
	room_name = request.POST.get('roomName')
	updated = RoomUsers.objects.filter(room_id=room_id, user_id=request.user.id).update(
		volume=request.POST['volume'],
		notifications=request.POST['notifications'] == 'true',
	)
	if updated != 1:
		raise ValidationError("You don't have access to this room")
	if room_name is not None:
		room_name = room_name.strip()
		if room_name and int(room_id) != settings.ALL_ROOM_ID:
			Room.objects.filter(id=room_id).update(name = room_name)
	return HttpResponse(settings.VALIDATION_IS_OK, content_type='text/plain')


@require_http_methods('GET')
@transaction.atomic
def get_firebase_playback(request):
	registration_id = request.META['HTTP_AUTH']
	logger.debug('Firebase playback, id %s', registration_id)
	query_sub_message = SubscriptionMessages.objects.filter(subscription__registration_id=registration_id, received=False).order_by('-message__time')[:1]
	sub_message = query_sub_message[0]
	SubscriptionMessages.objects.filter(id=sub_message.id).update(received=True)
	message = Message.objects.select_related("sender__username", "room__name").get(id=sub_message.message_id)
	data = {
		'title': message.sender.username,
		'options': {
			'body': message.content,
			'icon': md5url('images/favicon.ico'),
			'data': {
				'id': sub_message.message_id,
				'sender': message.sender.username,
				'room': message.room.name,
				'roomId': message.room_id
			},
			'requireInteraction': True
		},
	}
	return HttpResponse(json.dumps(data), content_type='application/json')


def test(request):
	return HttpResponse(settings.VALIDATION_IS_OK, content_type='text/plain')


@require_http_methods('POST')
@login_required_no_redirect(False)
@validation
def search_messages(request):
	data = request.POST['data']
	room_id = request.POST['room']
	offset = int(request.POST['offset'])
	if not RoomUsers.objects.filter(room_id=room_id, user_id=request.user.id).exists():
		raise ValidationError("You can't access this room")
	messages = Message.objects.filter(content__icontains=data, room_id=room_id).order_by('-id')[offset:offset+settings.MESSAGES_PER_SEARCH]
	imv = get_message_images_videos(messages)
	result = []
	for message in messages:
		files = MessagesCreator.prepare_img_video(imv, message.id)
		prep_m = MessagesCreator.create_message(message, files)
		result.append(prep_m)
	response = json.dumps(result)
	return HttpResponse(response, content_type='application/json')


@require_http_methods('POST')
def register_subscription(request):
	logger.debug('Subscription request,  %s', request)
	registration_id = request.POST['registration_id']
	agent = request.POST['agent']
	is_mobile = request.POST['is_mobile']
	ip = get_or_create_ip(get_client_ip(request), logger)
	Subscription.objects.update_or_create(
		registration_id=registration_id,
		defaults={
			'user': request.user,
			'inactive': False,
			'updated': datetime.datetime.now(),
			'agent': agent,
			'is_mobile': is_mobile == 'true',
			'ip': ip
		}
	)
	return HttpResponse(settings.VALIDATION_IS_OK, content_type='text/plain')

@require_http_methods('POST')
@validation
def validate_user(request):
	"""
	Validates user during registration
	"""
	utils.check_user(request.POST.get('username'))
	# hardcoded ok check in register.js
	return HttpResponse(settings.VALIDATION_IS_OK, content_type='text/plain')


def get_service_worker(request):  # this stub is only for development, this is replaced in nginx for prod
	worker = open(os.path.join(settings.STATIC_ROOT, 'js', 'sw.js'), 'rb')
	response = HttpResponse(content=worker)
	response['Content-Type'] = 'application/javascript'
	return response

@require_http_methods('GET')
@login_required_no_redirect(False)
def home(request):
	"""
	Login or logout navbar is creates by means of create_nav_page
	@return:  the x intercept of the line M{y=m*x+b}.
	"""
	context = csrf(request)
	ip = get_client_ip(request)
	if not UserJoinedInfo.objects.filter(Q(ip__ip=ip) & Q(user=request.user)).exists():
		ip_obj = get_or_create_ip(ip, logger)
		UserJoinedInfo.objects.create(ip=ip_obj, user=request.user)
	up = UserProfile.objects.defer('suggestions', 'highlight_code', 'embedded_youtube', 'online_change_sound', 'incoming_file_call_sound', 'message_sound', 'theme').get(id=request.user.id)
	context['suggestions'] = up.suggestions
	context['highlight_code'] = up.highlight_code
	context['message_sound'] = up.message_sound
	context['incoming_file_call_sound'] = up.incoming_file_call_sound
	context['online_change_sound'] = up.online_change_sound
	context['theme'] = up.theme
	context['embedded_youtube'] = up.embedded_youtube
	context['extensionId'] = settings.EXTENSION_ID
	context['extensionUrl'] = settings.EXTENSION_INSTALL_URL
	context['defaultRoomId'] = settings.ALL_ROOM_ID
	context['pingCloseDelay'] = settings.PING_CLOSE_JS_DELAY
	context['pingServerCloseDelay'] = settings.CLIENT_NO_SERVER_PING_CLOSE_TIMEOUT
	context['MESSAGES_PER_SEARCH'] = settings.MESSAGES_PER_SEARCH
	context['manifest'] = hasattr(settings, 'FIREBASE_API_KEY')
	context['apiUrl'] = settings.API_ADDRESS_PATTERN % request.get_host().split(':')[0]
	context['sendLogs'] = up.send_logs
	return render_to_response('chat.html', context, context_instance=RequestContext(request))


@login_required_no_redirect(True)
@require_http_methods(['POST'])
def logout(request):
	"""
	POST. Logs out into system.
	"""
	registration_id = request.POST.get('registration_id')
	if registration_id is not None:
		Subscription.objects.filter(registration_id=registration_id).delete()
	djangologout(request)
	return HttpResponse(settings.VALIDATION_IS_OK, content_type='text/plain')


@require_http_methods(['POST'])
@validation
def auth(request):
	"""
	Logs in into system.
	"""
	username = request.POST.get('username')
	password = request.POST.get('password')
	logger.debug('Auth request %s', hide_fields(request.POST, ('password',)))
	user = authenticate(username=username, password=password)
	if user is None:
		raise ValidationError('login or password is wrong');
	djangologin(request, user)
	request.session.save()
	return HttpResponse(request.session.session_key, content_type='text/plain')



def send_restore_password(request):
	"""
	Sends email verification code
	"""
	logger.debug('Recover password request %s', request)
	try:
		username_or_password = request.POST.get('username_or_password')
		check_captcha(request)
		user_profile = UserProfile.objects.get(Q(username=username_or_password) | Q(email=username_or_password))
		if not user_profile.email:
			raise ValidationError("You didn't specify email address for this user")
		verification = Verification(type_enum=Verification.TypeChoices.password, user_id=user_profile.id)
		verification.save()
		try:
			send_reset_password_email(request, user_profile, verification)
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
	return HttpResponse(message, content_type='text/plain')


@require_http_methods(['GET'])
def proceed_email_changed(request):
	try:
		with transaction.atomic():
			token = request.GET['token']
			logger.debug('Proceed change email with token %s', token)
			user, verification = utils.get_user_by_code(token, Verification.TypeChoices.email)
			new_ver = send_new_email_ver(request, user, verification.email)
			user.email = verification.email
			user.email_verification = new_ver
			user.save(update_fields=('email', 'email_verification'))
			verification.verified = True
			verification.save(update_fields=('verified',))
			logger.info('Email has been change for token %s user %s(id=%d)', token, user.username, user.id)
			return render_to_response(
				'email_changed.html',
				{'text': 'Your email has been changed to {}.'.format(verification.email)},
				context_instance=RequestContext(request)
			)
	except Exception as e:
		return render_to_response(
			'email_changed.html',
			{'text': 'Unable to change your email because {}'.format(e.message)}
			, context_instance=RequestContext(request)
		)


class RestorePassword(View):

	@transaction.atomic
	@validation
	def post(self, request):
		"""
		Sends email verification token
		"""
		token = request.POST.get('token', False)
		logger.debug('Proceed Recover password with token %s', token)
		user, verification = utils.get_user_by_code(token, Verification.TypeChoices.password)
		password = request.POST.get('password')
		check_password(password)
		user.set_password(password)
		user.save(update_fields=('password',))
		verification.verified = True
		verification.save(update_fields=('verified',))
		logger.info('Password has been change for token %s user %s(id=%d)', token, user.username, user.id)
		return HttpResponse(settings.VALIDATION_IS_OK, content_type='text/plain')

	def get(self, request):
		token = request.GET.get('token', False)
		logger.debug('Rendering restore password page with token  %s', token)
		try:
			user = utils.get_user_by_code(token, Verification.TypeChoices.password)[0]
			response = {
				'message': settings.VALIDATION_IS_OK,
				'restore_user': user.username,
				'token': token
			}
		except ValidationError as e:
			logger.debug('Rejecting verification token %s because %s', token, e)
			response = {'message': "Unable to confirm email with token {} because {}".format(token, e)}
		return render_to_response('reset_password.html', response, context_instance=RequestContext(request))


@require_http_methods('GET')
def confirm_email(request):
	"""
	Accept the verification token sent to email
	"""
	token = request.GET.get('token', False)
	logger.debug('Processing email confirm with token  %s', token)
	try:
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
	except Exception as e:
		logger.debug('Rejecting verification token %s because %s', token, e)
		message = ("Unable to confirm email with token {} because {}".format(token, e))
	response = {'message': message}
	return render_to_response('confirm_mail.html', response, context_instance=RequestContext(request))


@require_http_methods('GET')
def show_profile(request, profile_id):
	try:
		user_profile = UserProfile.objects.get(pk=profile_id)
		profile = MessagesCreator.get_user_profile(user_profile)
		profile['image'] = user_profile.photo.url if user_profile.photo.url else None
		return HttpResponse(json.dumps(profile), content_type='application/json')
	except ObjectDoesNotExist:
		raise Http404


@require_http_methods('GET')
def statistics(request):
	pie_data = IpAddress.objects.values('country').filter(country__isnull=False).annotate(count=Count("country"))
	return HttpResponse(json.dumps(list(pie_data)), content_type='application/json')


@transaction.atomic
def report_issue(request):
	logger.info('Saving issue: %s', hide_fields(request.POST, ('log',), huge=True))
	issue_text = request.POST['issue']
	issue = Issue.objects.get_or_create(content=issue_text)[0]
	issue_details = IssueDetails(
		sender_id=request.user.id,
		browser=request.POST.get('browser'),
		issue=issue,
		log=request.POST.get('log')
	)
	try:
		mail_admins("{} reported issue".format(request.user.username), issue_text, fail_silently=True)
	except Exception as e:
		logging.error("Failed to send issue email because {}".format(e))
	issue_details.save()
	return HttpResponse(settings.VALIDATION_IS_OK, content_type='text/plain')


@login_required_no_redirect()
@validation
def profile_change_password(request):
	passwd = request.POST['password']
	old_password = request.POST['old_password']
	if request.user.password:
		is_valid = authenticate(username=request.user.username, password=old_password)
		if not is_valid:
			raise ValidationError("Invalid old password")
	utils.check_password(passwd)
	hash_pass = make_password(passwd)
	User.objects.filter(id=request.user.id).update(
		password=hash_pass
	)
	send_password_changed(request, request.user.email)
	return HttpResponse(settings.VALIDATION_IS_OK, content_type='text/plain')


class RegisterView(View):

	@transaction.atomic
	@validation
	def post(self, request):
		rp = request.POST
		logger.info('Got register request %s', hide_fields(rp, ('password', 'repeatpassword')))
		(username, password, email) = (rp.get('username'), rp.get('password'), rp.get('email'))
		check_user(username)
		check_password(password)
		check_email(email)
		user_profile = UserProfile(username=username, email=email, sex_str=rp.get('sex'))
		user_profile.set_password(password)
		create_user_model(user_profile)
		# You must call authenticate before you can call login
		auth_user = authenticate(username=username, password=password)
		if email:
			send_sign_up_email(user_profile, request.get_host(), request)
		djangologin(request, auth_user)
		request.session.save()
		return HttpResponse(request.session.session_key, content_type='text/plain')
