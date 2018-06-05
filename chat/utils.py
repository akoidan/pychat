import sys

import base64
import datetime
import json
import logging
import re
import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.db import IntegrityError
from django.db import connection, OperationalError, InterfaceError
from django.db.models import Q
from django.template import RequestContext
from django.template.loader import render_to_string
from django.utils.safestring import mark_safe
from django.utils.timezone import utc
from io import BytesIO

from chat import local
from chat.models import Image, UploadedFile
from chat.models import Room
from chat.models import User
from chat.models import UserProfile, Verification, RoomUsers, IpAddress
from chat.py2_3 import urlopen, dict_values_to_list
from chat.tornado.constants import RedisPrefix
from chat.tornado.constants import VarNames
from chat.tornado.message_creator import MessagesCreator

USERNAME_REGEX = str(settings.MAX_USERNAME_LENGTH).join(['^[a-zA-Z-_0-9]{1,', '}$'])

logger = logging.getLogger(__name__)


def is_blank(check_str):
	if check_str and check_str.strip():
		return False
	else:
		return True


def get_or_create_room(channels, room_id, user_id):
	if room_id not in channels:
		raise ValidationError("Access denied, only allowed for channels {}".format(channels))
	room = do_db(Room.objects.get, id=room_id)
	if room.is_private:
		raise ValidationError("You can't add users to direct room, create a new room instead")
	try:
		Room.users.through.objects.create(room_id=room_id, user_id=user_id)
	except IntegrityError:
		raise ValidationError("User is already in channel")
	return room


def update_room(room_id, disabled):
	if not disabled:
		raise ValidationError('This room already exist')
	else:
		Room.objects.filter(id=room_id).update(disabled=False)


def get_history_message_query(messages, user_rooms, with_history):
	cb = with_history_q if with_history else no_history_q
	q_objects = Q()
	if messages:
		pmessages = json.loads(messages)
	else:
		pmessages = {}
	for room_id in user_rooms:
		room_hf = pmessages.get(str(room_id))
		if room_hf:
			cb(q_objects, room_id, room_hf['h'], room_hf['f'])
	return q_objects


def with_history_q(q_objects, room_id, h, f):
	q_objects.add(Q(id__gte=h, room_id=room_id), Q.OR)


def no_history_q(q_objects, room_id, h, f):
	q_objects.add(Q(room_id=room_id) & (
			(Q(id__gte=h) & Q(id__lte=f) & Q(edited_times__gt=0)) | Q(id__gt=f)), Q.OR)


def create_room(self_user_id, user_id):
	# get all self private rooms ids
	user_rooms = evaluate(Room.users.through.objects.filter(user_id=self_user_id, room__name__isnull=True).values('room_id'))
	# get private room that contains another user from rooms above
	if user_rooms and self_user_id == user_id:
		room_id = create_self_room(self_user_id,user_rooms)
	elif user_rooms:
		room_id = create_other_room(self_user_id, user_id, user_rooms)
	else:
		room_id = create_other_room_wo_check(self_user_id, user_id)
	return room_id


def create_other_room_wo_check(self_user_id, user_id):
	room = Room()
	room.save()
	room_id = room.id
	if self_user_id == user_id:
		RoomUsers(user_id=user_id, room_id=room_id).save()
	else:
		RoomUsers.objects.bulk_create([
			RoomUsers(user_id=self_user_id, room_id=room_id),
			RoomUsers(user_id=user_id, room_id=room_id),
		])
	return room_id


def create_other_room(self_user_id, user_id, user_rooms):
	rooms_query = RoomUsers.objects.filter(user_id=user_id, room__in=user_rooms)
	query = rooms_query.values('room__id', 'room__disabled')
	try:
		room = do_db(query.get)
		room_id = room['room__id']
		update_room(room_id, room['room__disabled'])
	except RoomUsers.DoesNotExist:
		room = Room()
		room.save()
		room_id = room.id
		RoomUsers.objects.bulk_create([
			RoomUsers(user_id=self_user_id, room_id=room_id),
			RoomUsers(user_id=user_id, room_id=room_id),
		])
	return room_id


def evaluate(query_set):
	do_db(len, query_set)
	return query_set


def create_self_room(self_user_id, user_rooms):
	room_ids = list([room['room_id'] for room in evaluate(user_rooms)])
	query = execute_query(settings.SELECT_SELF_ROOM, [room_ids, ])
	if query:
		room_id = query[0]['room__id']
		update_room(room_id, query[0]['room__disabled'])
	else:
		room = Room()
		room.save()
		room_id = room.id
		RoomUsers(user_id=self_user_id, room_id=room_id, notifications=False).save()
	return room_id

def validate_edit_message(self_id, message):
	if message.sender_id != self_id:
		raise ValidationError("You can only edit your messages")
	if message.deleted:
		raise ValidationError("Already deleted")


def do_db(callback, *args, **kwargs):
	try:
		return callback(*args, **kwargs)
	except (OperationalError, InterfaceError) as e:
		if 'MySQL server has gone away' in str(e):
			logger.warning('%s, reconnecting' % e)
			connection.close()
			return callback(*args, **kwargs)
		else:
			raise e


def execute_query(query, *args, **kwargs):
	cursor = connection.cursor()
	cursor.execute(query, *args, **kwargs)
	desc = cursor.description
	return [
		dict(zip([col[0] for col in desc], row))
		for row in cursor.fetchall()
	]


def hide_fields(post, fields, huge=False, fill_with='****'):
	"""
	:param post: Object that will be copied
	:type post: QueryDict
	:param fields: fields that will be removed
	:param fill_with: replace characters for hidden fields
	:param huge: if true object will be cloned and then fields will be removed
	:return: a shallow copy of dictionary without specified fields
	"""
	if not huge:
		# hide *fields in shallow copy
		res = post.copy()
		for field in fields:
			if field in post:  # check if field was absent
				res[field] = fill_with
	else:
		# copy everything but *fields
		res = {}
		for field in post:
			# _______________________if this is field to remove
			res[field] = post[field] if field not in fields else fill_with
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


def check_email(email):
	"""
	:raises ValidationError if specified email is registered or not valid
	"""
	if not email:
		return
	try:
		validate_email(email)
		# theoretically can throw returning 'more than 1' error
		UserProfile.objects.get(email=email)
		raise ValidationError('Email {} is already used'.format(email))
	except User.DoesNotExist:
		pass


def check_user(username):
	"""
	Checks if specified username is free to register
	:type username str
	:raises ValidationError exception if username is not valid
	"""
	# Skip javascript validation, only summary message
	validate_user(username)
	try:
		# theoretically can throw returning 'more than 1' error
		User.objects.get(username=username)
		raise ValidationError("Username {} is already used. Please select another one".format(username))
	except User.DoesNotExist:
		pass


def validate_user(username):
	if is_blank(username):
		raise ValidationError("Username can't be empty")
	if not re.match(USERNAME_REGEX, username):
		raise ValidationError("Username {} doesn't match regex {}".format(username, USERNAME_REGEX))


def get_client_ip(request):
	x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
	return x_forwarded_for.split(',')[-1].strip() if x_forwarded_for else request.META.get('REMOTE_ADDR')


def check_captcha(request):
	"""
	:type request: WSGIRequest
	:raises ValidationError: if captcha is not valid or not set
	If RECAPTCHA_PRIVATE_KEY is enabled in settings validates request with it
	"""
	if not hasattr(settings, 'RECAPTCHA_PRIVATE_KEY'):
		logger.debug('Skipping captcha validation')
		return
	try:
		captcha_rs = request.POST.get('g-recaptcha-response')
		url = "https://www.google.com/recaptcha/api/siteverify"
		params = {
			'secret': settings.RECAPTCHA_PRIVATE_KEY,
			'response': captcha_rs,
			'remoteip': local.client_ip
		}
		raw_response = requests.post(url, params=params, verify=True)
		response = raw_response.json()
		if not response.get('success', False):
			logger.debug('Captcha is NOT valid, response: %s', raw_response)
			raise ValidationError(
				response['error-codes'] if response.get('error-codes', None) else 'This captcha already used')
		logger.debug('Captcha is valid, response: %s', raw_response)
	except Exception as e:
		raise ValidationError('Unable to check captcha because {}'.format(e))


def send_sign_up_email(user, site_address, request):
	if user.email is not None:
		verification = Verification(user=user, type_enum=Verification.TypeChoices.register)
		verification.save()
		user.email_verification = verification
		user.save(update_fields=['email_verification'])
		link = "{}://{}/confirm_email?token={}".format(settings.SITE_PROTOCOL, site_address, verification.token)
		text = ('Hi {}, you have registered pychat'
				  '\nTo complete your registration please click on the url bellow: {}'
				  '\n\nIf you find any bugs or propositions you can post them {}').format(
			user.username, link, settings.ISSUES_REPORT_LINK)
		start_message = mark_safe((
			"You have registered in <b>Pychat</b>. If you find any bugs or propositions you can post them"
			" <a href='{}'>here</a>. To complete your registration please click on the link below.").format(
				settings.ISSUES_REPORT_LINK))
		context = {
			'username': user.username,
			'magicLink': link,
			'btnText': "CONFIRM SIGN UP",
			'greetings': start_message
		}
		html_message = render_to_string('sign_up_email.html', context, context_instance=RequestContext(request))
		logger.info('Sending verification email to userId %s (email %s)', user.id, user.email)
		try:
			send_mail("Confirm chat registration", text, site_address, [user.email, ], html_message=html_message, fail_silently=True)
		except Exception as e:
			logging.error("Failed to send registration email because {}".format(e))
		else:
			logger.info('Email %s has been sent', user.email)


def send_reset_password_email(request, user_profile, verification):
	link = "{}://{}/restore_password?token={}".format(settings.SITE_PROTOCOL, request.get_host(), verification.token)
	message = "{},\n" \
				 "You requested to change a password on site {}.\n" \
				 "To proceed click on the link {}\n" \
				 "If you didn't request the password change just ignore this mail" \
		.format(user_profile.username, request.get_host(), link)
	ip_info = get_or_create_ip(get_client_ip(request), logger)
	start_message = mark_safe(
		"You have requested to send you a magic link to quickly restore password to <b>Pychat</b>. "
		"If it wasn't you, you can safely ignore this email")
	context = {
		'username': user_profile.username,
		'magicLink': link,
		'ipInfo': ip_info.info,
		'ip': ip_info.ip,
		'btnText': "CHANGE PASSWORD",
		'timeCreated': verification.time,
		'greetings': start_message
	}
	html_message = render_to_string('token_email.html', context, context_instance=RequestContext(request))
	send_mail("Pychat: restore password", message, request.get_host(), (user_profile.email,), fail_silently=False,
				 html_message=html_message)


def get_user_by_code(token, type):
	"""
	:param token: token code to verify
	:type token: str
	:raises ValidationError: if token is not usable
	:return: UserProfile, Verification: if token is usable
	"""
	try:
		v = Verification.objects.get(token=token)
		if v.type_enum != type:
			raise ValidationError("it's not for this operation ")
		if v.verified:
			raise ValidationError("it's already used")
		# TODO move to sql query or leave here?
		if v.time < datetime.datetime.utcnow().replace(tzinfo=utc) - datetime.timedelta(days=1):
			raise ValidationError("it's expired")
		return UserProfile.objects.get(id=v.user_id), v
	except Verification.DoesNotExist:
		raise ValidationError('Unknown verification token')


def send_new_email_ver(request, user, email):
	new_ver = Verification(user=user, type_enum=Verification.TypeChoices.confirm_email, email=email)
	new_ver.save()
	link = "{}://{}/confirm_email?token={}".format(settings.SITE_PROTOCOL, request.get_host(), new_ver.token)
	text = ('Hi {}, you have changed email to curren on pychat \nTo verify it, please click on the url: {}') \
		.format(user.username, link)
	start_message = mark_safe("You have changed email to current one in  <b>Pychat</b>. \n"
									  "To stay safe please verify it by clicking on the url below.")
	context = {
		'username': user.username,
		'magicLink': link,
		'btnText': "CONFIRM THIS EMAIL",
		'greetings': start_message
	}
	html_message = render_to_string('sign_up_email.html', context, context_instance=RequestContext(request))
	logger.info('Sending verification email to userId %s (email %s)', user.id, email)
	try:
		send_mail("Confirm this email", text, request.get_host(), [email, ], html_message=html_message,
				 fail_silently=False)
		return new_ver
	except Exception as e:
		logger.exception("Failed to send email")
		raise ValidationError(e.message)


def send_email_change(request, username, old_email, verification, new_email):
	link = "{}://{}/change_email?token={}".format(settings.SITE_PROTOCOL, request.get_host(), verification.token)
	message = "{},\n" \
				 "You requested to change an email from {} to {} on site {}.\n" \
				 "To proceed click on the link {}\n" \
				 "If you didn't request the email change someone has hijacked your account. Please change your password" \
		.format(old_email, new_email, username, request.get_host(), link)
	ip_info = get_or_create_ip(get_client_ip(request), logger)
	start_message = mark_safe(
		"You have requested an email change on <b>Pychat</b>. After you click on the url bellow we replace email in your profile from current one ({}) to {}. If it wasn't you please change your password as soon as possible".format(old_email, new_email))
	context = {
		'username': username,
		'magicLink': link,
		'ipInfo': ip_info.info,
		'ip': ip_info.ip,
		'btnText': "CHANGE EMAIL",
		'timeCreated': verification.time,
		'greetings': start_message
	}
	html_message = render_to_string('token_email.html', context, context_instance=RequestContext(request))
	send_mail("Pychat: change email", message, request.get_host(), (old_email,), fail_silently=False,
				 html_message=html_message)


def send_password_changed(request, email):
	message = "Password has been changed for user {}".format(request.user.username)
	ip_info = get_or_create_ip(get_client_ip(request), logger)
	context = {
		'username': request.user.username,
		'ipInfo': ip_info.info,
		'ip': ip_info.ip,
		'timeCreated': datetime.datetime.now(),
	}
	html_message = render_to_string('change_password.html', context, context_instance=RequestContext(request))
	send_mail("Pychat: password change", message, request.get_host(), (email,), fail_silently=False,
				 html_message=html_message)


def send_email_changed(request, old_email, new_email):
	message = "Dmail been changed for user {}".format(request.user.username)
	ip_info = get_or_create_ip(get_client_ip(request), logger)
	context = {
		'username': request.user.username,
		'ipInfo': ip_info.info,
		'ip': ip_info.ip,
		'timeCreated': datetime.datetime.now(),
		'email': new_email,
	}
	html_message = render_to_string('change_email.html', context, context_instance=RequestContext(request))
	send_mail("Pychat: email change", message, request.get_host(), (old_email,), fail_silently=False,
				 html_message=html_message)


def extract_photo(image_base64, filename=None):
	base64_type_data = re.search(r'data:(\w+/(\w+));base64,(.*)$', image_base64)
	logger.debug('Parsing base64 image')
	image_data = base64_type_data.group(3)
	f = BytesIO(base64.b64decode(image_data))
	content_type = base64_type_data.group(1)
	name = filename or ".{}".format(base64_type_data.group(2))
	logger.debug('Base64 filename extension %s, content_type %s', name, content_type)
	image = InMemoryUploadedFile(
		f,
		field_name='photo',
		name=name,
		content_type=content_type,
		size=sys.getsizeof(f),
		charset=None)
	return image


def create_user_model(user):
	user.save()
	RoomUsers(user_id=user.id, room_id=settings.ALL_ROOM_ID, notifications=False).save()
	logger.info('Signed up new user %s, subscribed for channels with id %d', user, settings.ALL_ROOM_ID)
	return user


def create_ip_structure(ip, raw_response):
	response = json.loads(raw_response)
	if response['status'] != "success":
		raise Exception("Creating iprecord failed, server responded: %s" % raw_response)
	return IpAddress.objects.create(
		ip=ip,
		isp=response['isp'],
		country=response['country'],
		region=response['regionName'],
		city=response['city'],
		country_code=response['countryCode']
	)


def get_or_create_ip(ip, logger):
	def create_ip():
		f = urlopen(settings.IP_API_URL % ip)
		decode = f.read().decode("utf-8")
		return create_ip_structure(ip, decode)
	return get_or_create_ip_wrapper(ip, logger, create_ip)


def get_or_create_ip_wrapper(ip, logger, fetcher_ip_function):
	"""
	@param ip: ip to fetch info from
	@param logger initialized logger:
	@type IpAddress
	"""
	try:
		return IpAddress.objects.get(ip=ip)
	except IpAddress.DoesNotExist:
		try:
			if not hasattr(settings, 'IP_API_URL'):
				raise Exception("IP_API_URL aint set")
			return fetcher_ip_function()
		except Exception as e:
			logger.error("Error while creating ip with country info, because %s", e)
			return IpAddress.objects.create(ip=ip)


class EmailOrUsernameModelBackend(object):
	"""
	This is a ModelBacked that allows authentication with either a username or an email address.
	"""

	def authenticate(self, username=None, password=None):
		try:
			if '@' in username:
				user = UserProfile.objects.get(email=username)
			else:
				user = UserProfile.objects.get(username=username)
			if user.check_password(password):
				return user
		except User.DoesNotExist:
			return None

	def get_user(self, username):
		try:
			return get_user_model().objects.get(pk=username)
		except get_user_model().DoesNotExist:
			return None


def get_max_key(files):
	max = None
	evaluate(files)
	if files:
		for f in files:
			if max is None or f.symbol > max:
				max = f.symbol
	return max


def update_symbols(files, message):
	if message.symbol:
		order = ord(message.symbol)
		for up in files:
			if ord(up.symbol) <= order:
				order += 1
				new_symb = chr(order)
				message.content = message.content.replace(up.symbol, new_symb)
				up.symbol = new_symb
	new_symbol = get_max_key(files)
	if message.symbol is None or new_symbol > message.symbol:
		message.symbol = new_symbol


def get_message_images_videos(messages):
	ids = [message.id for message in messages if message.symbol]
	if ids:
		images = Image.objects.filter(message_id__in=ids)
	else:
		images = []
	return images


def up_files_to_img(files, message_id):
	blk_video = {}
	for f in files:
		stored_file = blk_video.setdefault(f.symbol, Image(symbol=f.symbol))
		if f.type_enum == UploadedFile.UploadedFileChoices.preview:
			stored_file.preview = f.file
		else:
			stored_file.message_id = message_id
			stored_file.img = f.file
			stored_file.type = f.type
	images = Image.objects.bulk_create(dict_values_to_list(blk_video))
	files.delete()
	return images