import json
import logging
import re
import random
import string
from logging import Filter
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import connection, OperationalError, InterfaceError
from django.db.models import Q
from tornado.httpclient import AsyncHTTPClient, HTTPRequest

from chat.models import Image, UploadedFile, get_milliseconds
from chat.models import User
from chat.models import UserProfile, IpAddress
from chat.py2_3 import dict_values_to_list

USERNAME_REGEX = str(settings.MAX_USERNAME_LENGTH).join(['^[a-zA-Z-_0-9]{1,', '}$'])

logger = logging.getLogger(__name__)

ONE_DAY = 60 * 60 * 24 * 1000

def is_blank(check_str):
	if check_str and check_str.strip():
		return False
	else:
		return True

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
			(Q(id__gte=h) & Q(id__lte=f) & Q(edited_times__gt=0) & Q(time__gt=get_milliseconds() - ONE_DAY)) | Q(id__gt=f)), Q.OR)


def evaluate(query_set):
	do_db(len, query_set)
	return query_set


def validate_edit_message(self_id, message):
	if message.sender_id != self_id:
		raise ValidationError("You can only edit your messages")
	if message.time + ONE_DAY < get_milliseconds():
		raise ValidationError("You can only edit messages that were send not more than 1 day")
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


http_client = AsyncHTTPClient()


def get_or_create_ip_model(user_ip, logger):
	try:
		return IpAddress.objects.get(ip=user_ip)
	except IpAddress.DoesNotExist:
		try:
			if not hasattr(settings, 'IP_API_URL'):
				raise Exception("IP_API_URL aint set")
			request = HTTPRequest(settings.IP_API_URL % user_ip, method="GET")
			raw_response = yield http_client.fetch(request)
			response = json.loads(raw_response.body)
			if response['status'] != "success":
				raise Exception("Creating iprecord failed, server responded: %s" % raw_response)
			return IpAddress.objects.create(
				ip=user_ip,
				isp=response['isp'],
				country=response['country'],
				region=response['regionName'],
				city=response['city'],
				country_code=response['countryCode'],
				lat=response['lat'],
				lon=response['lon'],
				zip=response['zip'],
				timezone=response['timezone']
			)
		except Exception as e:
			logger.error("Error while creating ip with country info, because %s", e)
			return IpAddress.objects.create(ip=user_ip)


def id_generator(size=16, chars=string.ascii_letters + string.digits):
	return ''.join(random.choice(chars) for _ in range(size))


def create_id(user_id=0, random=None):
	if not random or len(random) != settings.WS_ID_CHAR_LENGTH:
		random = id_generator(settings.WS_ID_CHAR_LENGTH)
	return "{:04d}:{}".format(user_id, random), random


class ContextFilter(Filter):

	def filter(self, record):
		if not hasattr(record, 'user_id'):
			record.user_id = None
		if not hasattr(record, 'id'):
			record.id = None
		if not hasattr(record, 'ip'):
			record.ip = None
		return True


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
