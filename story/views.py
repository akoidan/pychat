# -*- encoding: utf-8 -*-
from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.contrib.auth import authenticate
from django.contrib.auth import login as djangologin
from django.contrib.auth import logout as djangologout
from django.contrib.auth.models import User
from django.core.context_processors import csrf
from story.models import UserProfile
from threading import Thread
from .models import Messages
import random
from django.http import Http404
import string
from drealtime import iShoutClient


def validate_email(email):
	from django.core.validators import validate_email
	from django.core.exceptions import ValidationError

	try:
		validate_email(email)
	except ValidationError:
		return "Email is not correct"
	try:
		User.objects.get(email=email)
		return "This email is already registered"
	except User.DoesNotExist:
		return False


def validate_user(username):
	if username is None or username == '':
		return "User name can't be empty"
	try:
		User.objects.get(username=username)
		return 'This user name already registered'
	except User.DoesNotExist:
		return False


def shout(request):
	ishout_client = iShoutClient()
	ishout_client.broadcast(
		channel='notifications',
		data={'data': 'it works'})


def bs(request):
	return render_to_response("story/bootstrap.html")


def myshout(request):
	return render_to_response("story/shout.html")


def repr_dict(d):
	return '{%s}' % ', '.join("'%s': '%s'" % pair for pair in d.items())


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
				data={'user': request.user.username,
					'content': message.content,
					'hour': message.time.hour,
					'minute': message.time.minute}
			)
			message = 'message delivered'
			return HttpResponse(message, content_type='text/plain')
		else:
			messages = Messages.objects.all().order_by('pk').reverse()[:20]
			passed_messages = []
			for singleMess in reversed(messages):
				dict = {'hour': singleMess.time.hour,
						'minute': singleMess.time.minute,
						'content': singleMess.content,
						'user': User.objects.get_by_natural_key(singleMess.userid).username}
				passed_messages.append(repr_dict(dict))
			page = "story/logout.html"
			my_list = {'username': request.user.username, 'messages': passed_messages}
			c.update(my_list)
	else:
		page = 'story/login.html'
	return render_to_response(page, c)


def logout(request):
	djangologout(request)
	return home(request)


def test(request):
	return render_to_response("story/3.html")


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


def confirmemail(request):
	if request.method == 'GET':
		code = request.GET.get('code', False)
		try:
			u = UserProfile.objects.get(verify_code=code)
			if u.email_verified is False:
				u.email_verified = True
				u.save()
				message = 'verification code accepted'
			else:
				message = 'This code already accepted'
		except UserProfile.DoesNotExist:
			raise Http404
	return render_to_response("story/confirm_mail.html", {'message': message})


def id_generator(size=16, chars=string.ascii_letters + string.digits):
	return ''.join(random.choice(chars) for _ in range(size))


def register(request):
	if request.is_ajax():
		username = request.POST['username']
		password = request.POST['password']
		verify_email = request.POST.get('mailbox', False)
		email = request.POST['email']
		message = False
		if password is None or password == '':
			message = "Password can't be empty"
		if not message:
			message = validate_email(email)
		if not message:
			message = validate_user(username)
		if not message:
			User.objects.create_user(username, email, password)
			user = authenticate(username=username, password=password)
			profile = user.profile
			profile.verify_code = id_generator()
			profile.save()
			if verify_email:
				site = 'http://193.105.201.235'
				code = '/confirm_email?code=' + profile.verify_code
				text = 'Hi %s, you have registered on %s. To complete your registration click on the url bellow: %s%s' % (
					username, site, site, code)
				mailthread = Thread(target=user.email_user, args=("Confirm chat registration", text))
				mailthread.start()
			djangologin(request, user)
			message = 'account created'
		return HttpResponse(message, content_type='text/plain')
	else:
		c = {}
		mycrsf = csrf(request)
		c.update(mycrsf)
		c.update({'errorcode': "wellcome to register page"})
		return render_to_response("story/register.html", c)

