# -*- encoding: utf-8 -*-
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.core.exceptions import PermissionDenied, ObjectDoesNotExist, ValidationError
from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.contrib.auth import authenticate
from django.contrib.auth import login as djangologin
from django.contrib.auth import logout as djangologout
from django.core.context_processors import csrf
from django.views.decorators.http import require_http_methods
from story.apps import DefaultSettingsConfig
from story.models import UserProfile, UserSettings
from .models import Messages
from django.http import Http404
from story import registration_utils
from story.forms import UserSettingsForm
from django.http import HttpResponseRedirect
from story.logic import broadcast_message, send_user_list, get_user_settings, send_message_to_user
import json
from story.registration_utils import validate_password, check_email, send_email_verification, check_user


@require_http_methods(["POST"])
def validate_email(request):
	"""d@
	POST only, validates email during registration
	"""
	email = request.POST['email']
	try:
		registration_utils.validate_email(email)
		response = 'ok'
	except ValidationError as e:
		response = e.message
	return HttpResponse(response, content_type='text/plain')


@require_http_methods("POST")
def validate_user(request):
	"""
	Validates user during registration
	"""
	try:
		registration_utils.check_user(request.POST['username'])
		# hardcoded ok check in register.js
		message = 'ok'
	except ValidationError as e:
		message = e.message
	return HttpResponse(message, content_type='text/plain')


@require_http_methods("POST")
@login_required
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


def home(request):
	"""
	GET only, returns main Chat page.
	Login or logout navbar is creates by means of create_nav_page
	"""
	c = get_user_settings(request.user)
	c.update(csrf(request))
	create_nav_page(request, c)
	return render_to_response('story/chat.html', c)


@require_http_methods("POST")
@login_required
def send_message(request):
	"""
	Emits messages via Ishout
	"""
	content = request.POST.get('message', '')
	addressee = request.POST.get('addressee', '')
	if addressee:
		receiver = User.objects.get(username=addressee)
		message = Messages(sender=request.user, content=content, receiver=receiver)
		message.save()
		send_message_to_user(message, receiver)
	else:
		message = Messages(sender=request.user, content=content)
		message.save()
		broadcast_message(message)
	response = 'message delivered'
	return HttpResponse(response, content_type='text/plain')


def create_nav_page(request, c):
	"""
	GET only, returns main Chat page.
	Login or logout navbar is creates by means of create_nav_page
	"""
	if request.user.is_authenticated():
		page = 'story/logout.html'
		c.update({'username': request.user.username})
	else:
		page = 'story/login.html'
	c.update({'navbar_page': page})


@login_required()
def logout(request):
	"""
	POST. Logs out into system.
	"""
	djangologout(request)
	return home(request)


@require_http_methods(["POST"])
def auth(request):
	"""
	Logs in into system.
	"""
	username = request.POST['username']
	password = request.POST['password']
	user = authenticate(username=username, password=password)
	if user is not None:
		djangologin(request, user)
		send_user_list()
		message = "update"
	else:
		message = "Login or password is wrong"
	return HttpResponse(message, content_type='text/plain')


@require_http_methods("GET")
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
		create_nav_page(request, response)
		return render_to_response('story/confirm_mail.html', response)
	except UserProfile.DoesNotExist:
		raise Http404


def register(request):
	"""
	GET and POST. Returns the registration p age
	Registrate a new user from a submit form.
	"""
	# TODO move to separate methods post and get
	if request.method == 'POST':
		username = request.POST['username']
		password = request.POST['password']
		email = request.POST['email']
		verify_email = request.POST.get('mailbox', False)
		first_name = request.POST['first_name']
		last_name = request.POST['last_name']
		sex = request.POST.get('sex', None)
		try:
			check_user(username)
			validate_password(password)
			user = User.objects.create_user(username, email, password)
			if verify_email:
				check_email(email)
				send_email_verification(user)
			user.first_name = first_name
			user.last_name = last_name
			user.save()
			user = authenticate(username=username, password=password)
			profile = user.profile
			# TODO BUG only MALE
			profile.gender = sex
			profile.save()
			djangologin(request, user)
			# register,js redirect if message = 'Account created'
			message = 'Account created'
		except ValidationError as e:
			message = e.message
		return HttpResponse(message, content_type='text/plain')
	else:
		c = csrf(request)
		c.update({'error code': "welcome to register page"})
		create_nav_page(request, c)
		return render_to_response("story/register.html", c)


def profile(request):
	"""
	GET and POST. Take care about User customizable colors via django.forms,
	"""
	user = request.user
	if user.is_authenticated():
		if request.method == 'GET':
			try:
				user_settings = UserSettings.objects.get(pk=user.id)
				form = UserSettingsForm(instance=user_settings)
			except ObjectDoesNotExist:
				form = UserSettingsForm(DefaultSettingsConfig.colors)
			c = csrf(request)
			c['form'] = form
			create_nav_page(request, c)
			return render_to_response("story/profile.html", c)
		else:
			form = UserSettingsForm(request.POST)
			form.instance.pk = request.user.id
			form.save()
			return HttpResponseRedirect('/')
	else:
		raise PermissionDenied


def refresh_user_list(request):
	send_user_list()
	return HttpResponse('request has been sent', content_type='text/plain')