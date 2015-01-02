# -*- encoding: utf-8 -*-
from django.contrib.auth.models import User
from django.core.exceptions import PermissionDenied, ObjectDoesNotExist
from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.contrib.auth import authenticate
from django.contrib.auth import login as djangologin
from django.contrib.auth import logout as djangologout
from django.core.context_processors import csrf
from story.apps import DefaultSettingsConfig
from story.models import UserProfile, UserSettings
from .models import Messages, PrivateMessages
from django.http import Http404
from story import registration_utils
from story.forms import UserSettingsForm
from django.http import HttpResponseRedirect
from story.logic import get_message, broadcast_message, send_user_list, get_user_settings, send_message_to_user
import json


def validate_email(request):
	"""
	POST only, validates email during registration
	"""
	email = request.POST['email']
	response = registration_utils.validate_email(email)
	return HttpResponse(response, content_type='text/plain')


def validate_user(request):
	"""
	POST only, validates user during registration
	"""
	username = request.POST['username']
	response = registration_utils.validate_user(username)
	return HttpResponse(response, content_type='text/plain')


def get_messages(request):
	"""
	POST only, returns all public messages started from ID
	"""
	if request.user.is_authenticated() and request.method == 'POST':
		header_id = request.POST.get('headerId', -1)
		count = int(request.POST.get('count', 10))
		if header_id == -1:
			messages = Messages.objects.all().order_by('pk').reverse()[:count]
		else:
			messages = Messages.objects.filter(id__lt=header_id).order_by('pk').reverse()[:count]
		passed_messages = []
		# TODO print (messages.values()) get rid of get_message
		for singleMess in messages:
			passed_messages.append(get_message(singleMess))
		response = json.dumps(passed_messages)
	else:
		response = "can't get messages for noauthorized user"
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


def send_message(request):
	"""
	POST only, sends messages via Ishout
	"""
	if request.user.is_authenticated() and request.method == 'POST':
		content = request.POST.get('message', '')
		addressee = request.POST.get('addressee', '')
		if addressee:
			receiver = User.objects.get(username=addressee)
			message = PrivateMessages(userid=request.user, content=content, addressee=receiver)
			message.save()
			send_message_to_user(message, receiver)
		else:
			message = Messages(userid=request.user, content=content)
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


def logout(request):
	"""
	POST. Logs out into system.
	"""
	djangologout(request)
	return home(request)


def auth(request):
	"""
	POST only. Logs in into system.
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


def confirm_email(request):
	"""
	GET only. Acceps the verification code sent to email
	"""
	if request.method == 'GET':
		code = request.GET.get('code', False)
		try:
			u = UserProfile.objects.get(verify_code=code)
			if u.email_verified is False:
				u.email_verified = True
				u.save()
				message = 'verification code is accepted'
			else:
				message = 'This code is already accepted'
		except UserProfile.DoesNotExist:
			raise Http404
	else:
		message = "invalid request"
	response = {'message': message}
	create_nav_page(request, response)
	return render_to_response('story/confirm_mail.html', response)


def register(request):
	"""
	GET and POST. Returns the registration p age
	Registrate a new user from a submit form.
	"""
	if request.is_ajax():
		registration_result = registration_utils.register_user(
			request.POST['username'],
			request.POST['password'],
			request.POST['email'],
			request.POST.get('mailbox', False)
		)
		if registration_result['message'] is False:
			djangologin(request, registration_result['user'])
			# register,js redirect if message = 'Account created'
			registration_result['message'] = 'Account created'
		return HttpResponse(registration_result['message'], content_type='text/plain')
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