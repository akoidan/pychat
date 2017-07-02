from chat.models import Image
from chat.tornado.constants import VarNames
from chat.utils import extract_photo, get_max_key


def process_images(images, message):
	if images:
		if message.symbol:
			replace_symbols_if_needed(images, message)
		new_symbol = get_max_key(images)
		if message.symbol is None or new_symbol > message.symbol:
			message.symbol = new_symbol
	db_images = save_images(images, message.id)
	if message.symbol:  # fetch all, including that we just store
		db_images = Image.objects.filter(message_id=message.id)
	return prepare_img(db_images, message.id)


def save_images(images, message_id):
	db_images = []
	if images:
		db_images = [Image(
			message_id=message_id,
			img=extract_photo(
				images[k][VarNames.IMG_B64],
				images[k][VarNames.IMG_FILE_NAME]
			),
			symbol=k) for k in images]
		Image.objects.bulk_create(db_images)
	return db_images


def replace_symbols_if_needed(images, message):
	# if message was edited user wasn't notified about that and he edits message again
	# his symbol can go out of sync
	order = ord(message.symbol)
	new_dict = []
	for img in images:
		if img <= message.symbol:
			order += 1
			new_symb = chr(order)
			new_dict.append({
				'new': new_symb,
				'old': img,
				'value': images[img]
			})
			message.content = message.content.replace(img, new_symb)
	for d in new_dict:  # dictionary changed size during iteration
		del images[d['old']]
		images[d['new']] = d['value']


def prepare_img(images, message_id):
	"""
	:type message_id: int 
	:type images: list[chat.models.Image] 
	"""
	if images:
		return {x.symbol: x.img.url for x in images if x.message_id == message_id}


def get_message_images(messages):
	ids = [message.id for message in messages if message.symbol]
	if ids:
		images = Image.objects.filter(message_id__in=ids)
	else:
		images = []
	return images


