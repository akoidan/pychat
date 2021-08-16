import json
import logging
import os
import re
from pyfcm import FCMNotification
from PIL import Image as PilImage
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile, File
from django.db import connection
from django.db.models import Q
from django.utils.six import BytesIO
from tornado.httpclient import AsyncHTTPClient, HTTPRequest

from chat.log_filters import id_generator
from chat.models import Image, UploadedFile, MessageMention
from chat.models import IpAddress
from chat.models import User
FIREBASE_API_KEY = getattr(settings, "FIREBASE_API_KEY", None)
USERNAME_REGEX = str(settings.MAX_USERNAME_LENGTH).join(['^[a-zA-Z-_0-9]{1,', '}$'])

logger = logging.getLogger(__name__)

ONE_DAY = 60 * 60 * 24 * 1000

def is_blank(check_str):
	if check_str and check_str.strip():
		return False
	else:
		return True

# def get_history_message_query(messages, user_rooms, with_history):
# 	cb = with_history_q if with_history else no_history_q
# 	q_objects = Q()
# 	if messages:
# 		pmessages = json.loads(messages)
# 	else:
# 		pmessages = {}
# 	for room_id in user_rooms:
# 		room_hf = pmessages.get(str(room_id))
# 		if room_hf:
# 			cb(q_objects, room_id, room_hf['h'], room_hf['f'])
# 	return q_objects


def with_history_q(q_objects, room_id, h, f):
	q_objects.add(Q(id__gte=h, room_id=room_id), Q.OR)



def evaluate(query_set):
	if (query_set):
		len(query_set)
	return query_set


def validate_edit_message(self_id, message):
	if message.sender_id != self_id:
		raise ValidationError("You can only edit your messages")
	# we don't need this validation anymore, let users edit messages w/e they want
	# if message.time + ONE_DAY < get_milliseconds():
	# 	raise ValidationError("You can only edit messages that were send not more than 1 day")
	# if same user deletes message from different devices, it should not error
	# if message.deleted:
	# 	raise ValidationError("Already deleted")


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


def create_id(user_id=0, random=None):
	if not random or len(random) != settings.WS_ID_CHAR_LENGTH:
		random = id_generator(settings.WS_ID_CHAR_LENGTH)
	# if user is not authorized user_id would be None, and we would get unsupported format string
	return "{:04d}:{}".format(user_id if user_id else 0, random), random


def max_from_2(array_numbers):
	if all(v is None for v in array_numbers):
		return None
	return max([i for i in array_numbers if i is not None])


def get_max_symbol(symbol_holder):
	max = None
	evaluate(symbol_holder)
	if symbol_holder:
		for f in symbol_holder:
			if max is None or f.symbol > max:
				max = f.symbol
	return max


def get_max_symbol_dict(symbol_holder):
	max = None
	evaluate(symbol_holder)
	if symbol_holder:
		for f in symbol_holder:
			if max is None or f > max:
				max = f
	return max


def get_max_symbol_array(symbol_holder, key_extractor=lambda x: x):
	result = None
	evaluate(symbol_holder)
	if symbol_holder:
		for f in symbol_holder:
			if result is None or key_extractor(f) > result:
				result = key_extractor(f)
	return result


def update_symbols(files, tags,giphies,  message):
	# TODO refactor this crap
	if message.symbol:
		order = ord(message.symbol)
		if files:
			for up in files:
				if ord(up.symbol) <= order:
					order += 1
					new_symb = chr(order)
					message.content = message.content.replace(up.symbol, new_symb)
					up.symbol = new_symb
		if tags:
			for up in tags:
				if ord(up) <= order:
					order += 1
					new_symb = chr(order)
					message.content = message.content.replace(up.symbol, new_symb)
					tags[new_symb] = tags[up]
					del tags[up]
					up.symbol = new_symb
		if giphies:
			for giphy in giphies:
				if ord(giphy['symbol']) <= order:
					order += 1
					new_symb = chr(order)
					message.content = message.content.replace(giphy['symbol'], new_symb)
					giphy['symbol'] = new_symb
	if files:
		new_file_symbol = get_max_symbol(files)
		if message.symbol is None or new_file_symbol > message.symbol:
			message.symbol = new_file_symbol
	if tags:
		new_tag_symbol = get_max_symbol_dict(tags)
		if message.symbol is None or new_tag_symbol > message.symbol:
			message.symbol = new_tag_symbol
	if giphies:
		new_tag_symbol = get_max_symbol_array(giphies, lambda x: x['symbol'])
		if message.symbol is None or new_tag_symbol > message.symbol:
			message.symbol = new_tag_symbol


def get_thumbnail_url(thumbnail):
	return "{0}{1}".format(settings.MEDIA_URL, thumbnail) if thumbnail else None


def create_thumbnail(input_file, up):
	filename = None
	if isinstance(input_file, str):
		filename = input_file
		input_file = os.sep.join((settings.MEDIA_ROOT, input_file))
	im = PilImage.open(input_file)
	im.thumbnail((72, 72), PilImage.ANTIALIAS)
	jpeg = im.convert('RGB')
	thumb_io = BytesIO()
	if not filename:
		filename = im.filename
	jpeg.save(thumb_io, 'jpeg', quality=60)
	up.thumbnail.save(filename + '.jpeg', ContentFile(thumb_io.getvalue()), save=False)


def get_message_images_videos(messages):
	ids = [message.id for message in messages if message.symbol]
	if ids:
		images = Image.objects.filter(message_id__in=ids)
	else:
		images = []
	return images


def get_message_tags(messages):
	ids = [message.id for message in messages if message.symbol]
	if ids:
		mentions = MessageMention.objects.filter(message_id__in=ids)
	else:
		mentions = []
	return mentions


def up_files_to_img(files, giphies, message_id):
	blk_video = {}
	if files:
		for f in files:
			stored_file = blk_video.setdefault(f.symbol, Image(symbol=f.symbol))
			if f.type_enum == UploadedFile.UploadedFileChoices.preview:
				stored_file.preview = f.file # TODO do we need message id???
			else:
				stored_file.message_id = message_id
				stored_file.img = f.file
				stored_file.type = f.type
		files.delete()
	if giphies:
		for giphy in giphies:
			blk_video.setdefault(giphy['symbol'], Image(
				symbol=giphy['symbol'],
				message_id=message_id,
				absolute_url=giphy['url'],
				webp_absolute_url=giphy['webp'],
				type=Image.MediaTypeChoices.giphy.value
			))
	img_to_create = list(blk_video.values())
	if img_to_create:
		Image.objects.bulk_create(img_to_create)

