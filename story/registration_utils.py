import base64
from io import BytesIO
import re
from threading import Thread
import random
import string
from django.core.files.uploadedfile import InMemoryUploadedFile

from django.core.mail import send_mail
from django.core.validators import validate_email
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from django.forms import model_to_dict
import sys
from story.apps import DefaultSettingsConfig
from Chat import settings
from story.models import UserProfile

USERNAME_REGEX = "".join(['^[a-zA-Z-_0-9]{1,', str(settings.MAX_USERNAME_LENGTH), '}$'])


def is_blank(check_str):
	if check_str and check_str.strip():
		return False
	else:
		return True


def check_password(password):
	"""
	Checks if password is secure
	:raises ValidationError exception if password is not valid
	"""
	if is_blank(password):
		raise ValidationError("password can't be empty")
	if not re.match(u'^\S.+\S$', password):
		raise ValidationError("password should be at least 3 symbols")


def check_email(email, skip_but_used=True):
	"""
	:raises ValidationError if specified email is registered or not valid
	"""
	if skip_but_used:
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
	:type username str
	:raises ValidationError exception if username is not valid
	"""
	# Skip javascript validation, only summary message
	if is_blank(username):
		raise ValidationError("User name can't be empty")
	if not re.match(USERNAME_REGEX, username):
		raise ValidationError("User doesn't match regex " + USERNAME_REGEX)
	try:
		# theoretically can throw returning 'more than 1' error
		UserProfile.objects.get(username=username)
		raise ValidationError("This user name already used")
	except UserProfile.DoesNotExist:
		pass


def id_generator(size=16, chars=string.ascii_letters + string.digits):
	return ''.join(random.choice(chars) for _ in range(size))


def send_email_verification(user, site_address):
	if user.email is not None:
		user.verify_code = id_generator()
		user.save()
		code = '/confirm_email?code=' + user.verify_code
		text = 'Hi %s, you have registered on chat. To complete your registration click on the url bellow: http://%s%s' %\
			(user.username, site_address, code)
		mail_thread = Thread(
			target=send_mail,
			args=("Confirm chat registration", text, site_address, [user.email]))
		mail_thread.start()


def extract_photo(image_base64):
	image_data = re.search(r'base64,(.*)', image_base64).group(1)
	file = BytesIO(base64.b64decode(image_data))
	image = InMemoryUploadedFile(
		file,
		field_name='photo',
		name='sdf',
		content_type="image/jpeg",
		size=sys.getsizeof(file),
		charset=None)
	return image