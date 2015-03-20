# -*- encoding: utf-8 -*-
import json

from django.contrib.auth.decorators import login_required, permission_required
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.contrib.auth import authenticate
from django.contrib.auth import login as djangologin
from django.contrib.auth import logout as djangologout
from django.core.context_processors import csrf
from django.template import RequestContext
from django.views.decorators.http import require_http_methods
from django.http import Http404
from django.http import HttpResponseRedirect

from story.apps import DefaultSettingsConfig
from story.decorators import login_required_no_redirect
from story.models import UserProfile, UserSettings
from .models import Messages
from story import registration_utils
from story.forms import UserSettingsForm, UserProfileForm
from story.logic import broadcast_message, send_user_list, get_user_settings, send_message_to_user
from story.registration_utils import check_email, send_email_verification, check_user, check_password


@require_http_methods(['POST'])
def validate_email(request):
	"""
	POST only, validates email during registration
	"""
	email = request.POST.get('email')
	try:
		registration_utils.validate_email(email)
		response = 'ok'
	except ValidationError as e:
		response = e.message
	return HttpResponse(response, content_type='text/plain')


@require_http_methods('POST')
def validate_user(request):
	"""
	Validates user during registration
	"""
	try:
		registration_utils.check_user(request.POST.get('username'))
		# hardcoded ok check in register.js
		message = 'ok'
	except ValidationError as e:
		message = e.message
	return HttpResponse(message, content_type='text/plain')


@require_http_methods('POST')
@permission_required(None, raise_exception=True)
def get_messages(request):
	"""
	Returns all public messages started from ID
	"""
	header_id = request.POST.get('headerId', -1)
	count = int(request.POST.get('count', 10))
	if header_id == -1:
		messages = Messages.objects.filter(receiver=None).order_by('-pk')[:count]
	else:
		messages = Messages.objects.filter(id__lt=header_id, receiver=None).order_by('-pk')[:count]
	response = json.dumps([message.json for message in messages])
	return HttpResponse(response, content_type='text/plain')


@require_http_methods('GET')
def home(request):
	"""
	GET only, returns main Chat page.
	Login or logout navbar is creates by means of create_nav_page
	"""
	c = get_user_settings(request.user)
	c.update(csrf(request))
	return render_to_response('story/chat.html', c,  context_instance=RequestContext(request))


@require_http_methods('POST')
@permission_required(None, raise_exception=True)
def send_message(request):
	"""
	Emits messages via Ishout
	"""
	content = request.POST.get('message', '')
	addressee = request.POST.get('addressee', '')
	if addressee:
		receiver = UserProfile.objects.get(username=addressee)
		message = Messages(sender=request.user, content=content, receiver=receiver)
		message.save()
		send_message_to_user(message, receiver)
	else:
		message = Messages(sender=request.user, content=content)
		message.save()
		broadcast_message(message)
	response = 'message delivered'
	return HttpResponse(response, content_type='text/plain')


@permission_required(None, raise_exception=True)
def logout(request):
	"""
	POST. Logs out into system.
	"""
	djangologout(request)
	return home(request)


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
		send_user_list()
		message = 'update'
	else:
		message = 'Login or password is wrong'
	return HttpResponse(message, content_type='text/plain')


@require_http_methods('GET')
def confirm_email(request):
	"""
	Accept the verification code sent to email
	"""
	code = request.GET.get('code', False)
	try:
		u = UserProfile.objects.get(verify_code=code)
		if u.email_verified is False:
			u.email_verified = True
			u.save()
			message = 'verification code is accepted'
		else:
			message = 'This code is already accepted'
		response = {'message': message}
		return render_to_response('story/confirm_mail.html', response,  context_instance=RequestContext(request))
	except UserProfile.DoesNotExist:
		raise Http404


@require_http_methods('GET')
def get_register_page(request):
	c = csrf(request)
	c.update({'error code': "welcome to register page"})
	return render_to_response("story/register.html", c,  context_instance=RequestContext(request))


@require_http_methods('POST')
def register(request):
	try:
		rp = request.POST
		(username, password, email, verify_email) = (
			rp.get('username'), rp.get('password'), rp.get('email'), rp.get('mailbox'))
		check_user(username)
		check_password(password)
		if verify_email:
			check_email(email)
		# TODO
		user = UserProfile(username=username, email=email, sex=1 if rp.get('sex') == 'Male' else 2)
		user.set_password(password)
		user.save()
		# You must call authenticate before you can call login
		auth_user = authenticate(username=username, password=password)
		djangologin(request, auth_user)
		# register,js redirect if message = 'Account created'
		message = 'Account created'
		if verify_email:
			send_email_verification(user)
	except ValidationError as e:
		message = e.message
	return HttpResponse(message, content_type='text/plain')


@permission_required(None, raise_exception=True)
def profile(request):
	if request.method == 'GET':
		user_profile = UserProfile.objects.get(pk=request.user.id)
		form = UserProfileForm(instance=user_profile)
		c = csrf(request)
		c['form'] = form
		return render_to_response('story/profile.html', c,  context_instance=RequestContext(request))
	elif request.method == 'POST':
		user_profile = UserProfile.objects.get(pk=request.user.id)
		form = UserProfileForm(request.POST, request.FILES, instance=user_profile)
		if form.is_valid():
			form.save()
		else:
			return render_to_response('story/response.html', {'message': form.errors}, context_instance=RequestContext(request))
		return HttpResponseRedirect('/')
	else:
		raise PermissionError


@permission_required(None, raise_exception=True)
def settings(request):
	"""
	GET and POST. Take care about User customizable colors via django.forms,
	"""
	if request.method == 'GET':
		try:
			user_settings = UserSettings.objects.get(pk=request.user.id)
			form = UserSettingsForm(instance=user_settings)
		except ObjectDoesNotExist:
			form = UserSettingsForm(DefaultSettingsConfig.colors)
		c = csrf(request)
		c['form'] = form
		return render_to_response('story/settings.html', c,  context_instance=RequestContext(request))
	elif request.method == 'POST':
		form = UserSettingsForm(request.POST)
		form.instance.pk = request.user.id
		form.save()
		return HttpResponseRedirect('/')
	else:
		raise PermissionError


def refresh_user_list(request):
	send_user_list()
	return HttpResponse('request has been sent', content_type='text/plain')