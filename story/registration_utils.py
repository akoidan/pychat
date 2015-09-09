import base64
from io import BytesIO
import logging
import re
from threading import Thread
import sys

from django.core.files.uploadedfile import InMemoryUploadedFile
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.core.exceptions import ValidationError

from Chat import settings
from Chat.log_filters import id_generator
from Chat.settings import ISSUES_REPORT_LINK
from story.models import UserProfile

USERNAME_REGEX = "".join(['^[a-zA-Z-_0-9]{1,', str(settings.MAX_USERNAME_LENGTH), '}$'])

logger = logging.getLogger(__name__)


def is_blank(check_str):
	if check_str and check_str.strip():
		return False
	else:
		return True


def hide_fields(post, *fields, huge=False):
	"""
	:param post: QueryDict
	:param fields: fields in dict to replace with ****
	:return: a shallow copy of dictionary with replaced fields
	"""

	if not huge:
		# hide *fields in shallow copy
		res = post.copy()
		for field in fields:
			res[field] = '****'
	else:
		# copy everything but *fields
		res = {}
		for field in post:
			if field not in fields:
				res[field] = post[field]
			else:
				res[field] = '****'
	return res


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


def send_email_verification(user, site_address):
	if user.email is not None:
		user.verify_code = id_generator()
		user.save()
		code = '/confirm_email?code=' + user.verify_code

		text = 'Hi %s, you have registered on our %s.' \
			'\nTo complete your registration click on the url bellow: http://%s%s .' \
			'\n\n If you have any questions or suggestion, please post them here %s' %\
			(user.username, site_address, site_address,  code, ISSUES_REPORT_LINK)

		mail_thread = Thread(
			target=send_mail,
			args=("Confirm chat registration", text, site_address, [user.email]))
		logger.info('Sending verification email to userId %s (email %s)', user.id, user.email)
		mail_thread.start()


def extract_photo(image_base64):
	base64_type_data = re.search(r'data:(\w+/(\w+));base64,(.*)$', image_base64)
	logger.debug('Parsing base64 image')
	image_data = base64_type_data.group(3)
	file = BytesIO(base64.b64decode(image_data))
	content_type = base64_type_data.group(1)
	name = base64_type_data.group(2)
	logger.debug('Base64 filename extension %s, content_type %s', name, content_type)
	image = InMemoryUploadedFile(
		file,
		field_name='photo',
		name=name,
		content_type=content_type,
		size=sys.getsizeof(file),
		charset=None)
	return image
