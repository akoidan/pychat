__author__ = 'andrew'
from django.contrib.auth.models import User
from threading import Thread
from django.contrib.auth import authenticate
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


def id_generator(size=16, chars=string.ascii_letters + string.digits):
	return ''.join(random.choice(chars) for _ in range(size))


def register_user(username, password, email, verify_email):
	message = False
	user = None
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
			mail_thread = Thread(target=user.email_user, args=("Confirm chat registration", text))
			mail_thread.start()
	return {'user': user, 'message': message}
