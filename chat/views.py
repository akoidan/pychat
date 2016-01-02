# -*- encoding: utf-8 -*-
import json

from django.contrib.auth import authenticate
from django.contrib.auth import login as djangologin
from django.contrib.auth import logout as djangologout
from django.core.context_processors import csrf
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import transaction
from django.http import Http404
from django.http import HttpResponse, HttpResponseNotAllowed
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.views.decorators.http import require_http_methods

from chat import utils
from chat.decorators import login_required_no_redirect
from chat.forms import UserProfileForm, UserProfileReadOnlyForm
from chat.models import Issue, Room, IssueDetails, IpAddress, UserProfile
from chat.settings import ANONYMOUS_REDIS_ROOM, REGISTERED_REDIS_ROOM, VALIDATION_IS_OK, DATE_INPUT_FORMATS_JS, logging
from chat.utils import hide_fields, check_user, check_password, check_email, extract_photo, send_email_verification

logger = logging.getLogger(__name__)


@require_http_methods(['POST'])
def validate_email(request):
	"""
	POST only, validates email during registration
	"""
	email = request.POST.get('email')
	try:
		utils.check_email(email)
		response = VALIDATION_IS_OK
	except ValidationError as e:
		response = e.message
	return HttpResponse(response, content_type='text/plain')


@require_http_methods(['GET'])
def update_session_key(request):
	"""
	Creates a new session key, saves it to session store and to response
	"""
	old_key = request.session.session_key
	request.session.create()  # updates the session_key
	logger.info("Session key %s has been updated to %s", old_key, request.session.session_key)
	request.session.modified = True
	return HttpResponse(VALIDATION_IS_OK, content_type='text/plain')


@require_http_methods('POST')
def validate_user(request):
	"""
	Validates user during registration
	"""
	try:
		username = request.POST.get('username')
		utils.check_user(username)
		# hardcoded ok check in register.js
		message = VALIDATION_IS_OK
	except ValidationError as e:
		message = e.message
	return HttpResponse(message, content_type='text/plain')


@require_http_methods('GET')
def home(request):
	"""
	Login or logout navbar is creates by means of create_nav_page
	@return:  the x intercept of the line M{y=m*x+b}.
	"""
	return render_to_response('chat.html', csrf(request), context_instance=RequestContext(request))


@login_required_no_redirect
def logout(request):
	"""
	POST. Logs out into system.
	"""
	djangologout(request)
	response = HttpResponseRedirect('/')
	return response


@require_http_methods(['POST'])
def auth(request):
	"""
	Logs in into system.
	"""
	username = request.POST.get('username')
	password = request.POST.get('password')
	user = authenticate(username=username, password=password)
	if user is not None:
		djangologin(request, user)
		message = VALIDATION_IS_OK
	else:
		message = 'Login or password is wrong'
	logger.debug('Auth request %s ; Response: %s', hide_fields(request.POST, 'password'), message)
	response = HttpResponse(message, content_type='text/plain')
	return response


@require_http_methods('GET')
def confirm_email(request):
	"""
	Accept the verification code sent to email
	"""
	code = request.GET.get('code', False)
	try:
		u = UserProfile.objects.get(verify_code=code)
		logger.debug('Processing email confirm (code %s) for user %s', code, u)
		if u.email_verified is False:
			u.email_verified = True
			u.save()
			message = VALIDATION_IS_OK
			logger.info('Email verification code has been accepted')
		else:
			message = 'This code is already accepted'
			logger.debug(message)
		response = {'message': message}
		return render_to_response('confirm_mail.html', response, context_instance=RequestContext(request))
	except UserProfile.DoesNotExist:
		logger.debug('Rejecting verification code %s', code)
		raise Http404


@require_http_methods('GET')
def get_register_page(request):
	c = csrf(request)
	c.update({'error code': "welcome to register page"})
	return render_to_response("register.html", c, context_instance=RequestContext(request))


@transaction.atomic
@require_http_methods('POST')
def register(request):
	try:
		rp = request.POST
		logger.info('Got register request %s', hide_fields(rp, 'password', 'repeatpassword'))
		(username, password, email) = (rp.get('username').strip(), rp.get('password').strip(), rp.get('email').strip())
		check_user(username)
		check_password(password)
		check_email(email)
		user = UserProfile(username=username, email=email, sex_str=rp.get('sex'))
		user.set_password(password)
		default_thread, created_default = Room.objects.get_or_create(name=ANONYMOUS_REDIS_ROOM)
		registered_only, created_registered = Room.objects.get_or_create(name=REGISTERED_REDIS_ROOM)
		user.save()
		user.rooms.add(default_thread)
		user.rooms.add(registered_only)
		user.save()
		logger.info(
			'Signed up new user %s, subscribed for channels %s, %s',
			user, registered_only.name, default_thread.name
		)
		# You must call authenticate before you can call login
		auth_user = authenticate(username=username, password=password)
		djangologin(request, auth_user)
		# register,js redirect if message = 'Account created'
		message = VALIDATION_IS_OK
		if email:
			send_email_verification(user, request.get_host())
	except ValidationError as e:
		message = e.message
		logger.debug('Rejecting request because "%s"', message)
	return HttpResponse(message, content_type='text/plain')


@require_http_methods('GET')
@login_required_no_redirect
def change_profile(request):
	user_profile = UserProfile.objects.get(pk=request.user.id)
	form = UserProfileForm(instance=user_profile)
	c = csrf(request)
	c['form'] = form
	c['date_format'] = DATE_INPUT_FORMATS_JS
	return render_to_response('change_profile.html', c, context_instance=RequestContext(request))


@require_http_methods('GET')
def show_profile(request, profile_id):
	try:
		user_profile = UserProfile.objects.get(pk=profile_id)
		form = UserProfileReadOnlyForm(instance=user_profile)
		form.username = user_profile.username
		return render_to_response(
			'show_profile.html',
			{'form': form},
			context_instance=RequestContext(request)
		)
	except ObjectDoesNotExist:
		raise Http404


@require_http_methods('POST')
@login_required_no_redirect
def save_profile(request):
	logger.info('Saving profile: %s', hide_fields(request.POST, "base64_image", huge=True))
	user_profile = UserProfile.objects.get(pk=request.user.id)
	image_base64 = request.POST.get('base64_image')

	if image_base64 is not None:
		image = extract_photo(image_base64)
		request.FILES['photo'] = image

	form = UserProfileForm(request.POST, request.FILES, instance=user_profile)
	if form.is_valid():
		form.save()
		response = VALIDATION_IS_OK
	else:
		response = form.errors
	return HttpResponse(response, content_type='text/plain')


@transaction.atomic
@require_http_methods(('POST', 'GET'))
def report_issue(request):
	if request.method == 'GET':
		return render_to_response(
			'issue.html',  # getattr for anonymous.email
			{'email': getattr(request.user, 'email', '')},
			context_instance=RequestContext(request)
		)
	elif request.method == 'POST':
		logger.info('Saving issue: %s', hide_fields(request.POST, 'log', huge=True))
		issue, created = Issue.objects.get_or_create(content=request.POST['issue'])
		issue_details = IssueDetails(
			sender_id=request.user.id,
			email=request.POST.get('email'),
			browser=request.POST.get('browser'),
			issue=issue,
			log=request.POST.get('log')
		)
		issue_details.save()

		return HttpResponse(VALIDATION_IS_OK, content_type='text/plain')
	else:
		raise HttpResponseNotAllowed


@require_http_methods('GET')
def hack(request):
	return render_to_response('')


@require_http_methods('GET')
def statistics(request):
	pie = {}
	found_ip = []
	for address in IpAddress.objects.all():
		if address.country and address.ip not in found_ip:
			found_ip.append(address.ip)
			pie[address.country] = pie.get(address.country, 0) + 1
	pie_data = [{'country': key, "count": value} for key, value in pie.items()]
	return render_to_response(
		'statistic.html',
		{'dataProvider': json.dumps(pie_data)},
		context_instance=RequestContext(request)
	)
