__author__ = 'andrew'
import re
from django.contrib.auth.models import User
from threading import Thread
from django.contrib.auth import authenticate
from django.conf import settings
import random
import string

def validate_email(email):
	from django.core.validators import validate_email
	from django.core.exceptions import ValidationError

	try:
		validate_email(email)
	except ValidationError:
		return "Email is not correct"
	try:
		# theoretically can throw returning 'more than 1' error
		User.objects.get(email=email)
		return "This email is already used"
	except User.DoesNotExist:
		return False


def validate_user(username):
	if username is None or username == '':
		return "User name can't be empty"
	elif len(username) > 16:
		return "User is too long. Max 16 symbols"
	if not re.match('^[A-Za-z0-9-_]*$',username):
		return "Only letters, numbers, dashes or underlines"
	try:
		# theoretically can throw returning 'more than 1' error
		User.objects.get(username=username)
		return 'This user name already used'
	except User.DoesNotExist:
		return False


def register_user(username, password, email, verify_email, first_name, last_name, sex):
	message = False
	user = None
	if password is None or password == '':
		message = "Password can't be empty"
	if message is False and verify_email:
		message = validate_email(email)
	if message is False:
		message = validate_user(username)
	if message is False:
		user = User.objects.create_user(username, email, password)
		user.first_name = first_name
		user.last_name = last_name
		user.save()
		user = authenticate(username=username, password=password)
		profile = user.profile
		profile.gender = sex
		profile.save()
		if verify_email:
			send_email_verification(user)
	return {'user': user, 'message': message}


def id_generator(size=16, chars=string.ascii_letters + string.digits):
	return ''.join(random.choice(chars) for _ in range(size))


def send_email_verification(user):
	if user.email is not None:
		user.profile.verify_code = id_generator()
		user.prifle.save()
		site = 'http://' + getattr(settings, 'HOST_IP') + ':' + getattr(settings, 'SERVER_PORT')
		code = '/confirm_email?code=' + user.profile.verify_code
		text = 'Hi %s, you have registered on %s. To complete your registration click on the url bellow: %s%s' % (
		user.username, site, site, code)
		mail_thread = Thread(target=user.email_user, args=("Confirm chat registration", text))
		mail_thread.start()