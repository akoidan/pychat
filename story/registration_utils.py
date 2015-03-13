import re
from threading import Thread
import random
import string

from django.conf import settings
from django.core.validators import validate_email
from django.core.exceptions import ValidationError

from story.models import UserProfile


def check_password(password):
	"""
	Checks if password is secure
	:raises ValidationError exception if password is not valid
	"""
	if password is None or password == '':
		raise ValidationError("password can't be empty")
	if len(password) < 3:
		raise ValidationError("password should be at least 3 symbols")


def check_email(email):
	"""
	:raises ValidationError if specified email is registered or not valid
	"""
	validate_email(email)
	try:
		# theoretically can throw returning 'more than 1' error
		UserProfile.objects.get(email=email)
		raise ValidationError('This email is already used')
	except UserProfile.DoesNotExist:
		pass


def check_user(username):
	"""
	Checks if specified username is free to register
	:raises ValidationError exception if username is not valid
	"""
	if username is None or username == '':
		raise ValidationError("User name can't be empty")
	if len(username) > 16:
		raise ValidationError("User is too long. Max 16 symbols")
	if not re.match('^[A-Za-z0-9-_]*$', username):
		raise ValidationError("Only letters, numbers, dashes or underlines")
	try:
		# theoretically can throw returning 'more than 1' error
		UserProfile.objects.get(username=username)
		raise ValidationError("This user name already used")
	except UserProfile.DoesNotExist:
		pass


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