# -*- encoding: utf-8 -*-
from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.contrib.auth import authenticate
from django.contrib.auth import login as djangologin
from django.contrib.auth import logout as djangologout
from django.contrib.auth.models import User
from django.core.context_processors import csrf
from story.models import UserProfile, UserSettings
from .models import Messages
from django.http import Http404
from drealtime import iShoutClient
from story import registration_utils
from story.forms import UserSettingsForm
from django.http import HttpResponseRedirect
import json


def validate_email(request):
	email = request.POST['email']
	response = registration_utils.validate_email(email)
	return HttpResponse(response, content_type='text/plain')


def validate_user(request):
	username = request.POST['username']
	response = registration_utils.validate_user(username)
	return HttpResponse(response, content_type='text/plain')


def shout(request):
	ishout_client = iShoutClient()
	ishout_client.broadcast(
		channel='notifications',
		data={'data': 'it works'})


def repr_dict(d):
	return '{%s}' % ', '.join("'%s': '%s'" % pair for pair in d.items())


def get_messages(request):
	if request.user.is_authenticated() and request.method == 'POST':
		header_id = request.POST.get('header_id', -1)
		count = int(request.POST.get('count', 10))
		# TODO SECURITY BREACH with count -> infinity
		if header_id == -1:
			messages = Messages.objects.all().order_by('pk').reverse()[:count]
		else:
			messages = Messages.objects.filter(id__lt=header_id).order_by('pk').reverse()[:count]
		passed_messages = []
		for singleMess in reversed(messages):
			messages = {
				'hour': singleMess.time.hour,
				'minute': singleMess.time.minute,
				'second': singleMess.time.second,
				'content': singleMess.content,
				'user': User.objects.get_by_natural_key(singleMess.userid).username,
				'id': singleMess.id
			}
			passed_messages.append(repr_dict(messages))
		response = json.dumps(passed_messages)
	else:
		response = "can't get messages for noauthorized user"
	return HttpResponse(response, content_type='text/plain')


# TODO сombine duplicate of code with message somehow... response = json.dumps(passed_messages)
def home(request):
	c = {}
	c.update(csrf(request))
	if request.user.is_authenticated():
		if request.method == 'POST':
			content = request.POST.get('message', '')
			message = Messages(userid=request.user, content=content)
			message.save()
			ishout_client = iShoutClient()
			ishout_client.broadcast(
				channel='notifications',
				data={
					'user': request.user.username,
					'content': message.content,
					'hour': message.time.hour,
					'minute': message.time.minute,
					'second': message.time.second,
					'id': message.id
				}
			)
			message = 'message delivered'
			return HttpResponse(message, content_type='text/plain')
	create_nav_page(request, c)
	return render_to_response('story/chat.html', c)


def create_nav_page(request, c):
	if request.user.is_authenticated():
		page = 'story/logout.html'
		c.update({'username': request.user.username})
	else:
		page = 'story/login.html'
	c.update({'navbar_page': page})


def logout(request):
	djangologout(request)
	return home(request)


def auth(request):
	username = request.POST['username']
	password = request.POST['password']
	user = authenticate(username=username, password=password)
	if user is not None:
		djangologin(request, user)
		message = "update"
	else:
		message = "Login or password is wrong"
	return HttpResponse(message, content_type='text/plain')


def confirm_email(request):
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
	# TODO csrf?
	return render_to_response('story/confirm_mail.html', {'message': message})


def register(request):
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
		c = {}
		mycrsf = csrf(request)
		c.update(mycrsf)
		c.update({'error code': "welcome to register page"})
		create_nav_page(request, c)
		return render_to_response("story/register.html", c)


def profile(request):
	user = request.user
	if user.is_authenticated():
		if request.method == 'GET':
			user_settings = UserSettings.objects.get(pk=user.id)
			form = UserSettingsForm(instance=user_settings)
			c = {}
			c['form'] = form
			my_crsf = csrf(request)
			c.update(my_crsf)
			create_nav_page(request, c)
			return render_to_response("story/profile.html", c)
		else:
			form = UserSettingsForm(request.POST)
			if form.is_valid():
				form.id = request.user.id
				form.save()
			return HttpResponseRedirect('/')


