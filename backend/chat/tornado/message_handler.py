import json
import logging
import re

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db.models import Q, Max
from tornado import gen
from tornado.gen import Task
from tornado.httpclient import HTTPRequest
from tornado.ioloop import IOLoop
from tornadoredis import Client

from chat.global_redis import remove_parsable_prefix, encode_message
from chat.log_filters import id_generator
from chat.models import Message, Room, RoomUsers, Subscription, SubscriptionMessages, MessageHistory, \
	UploadedFile, Image, get_milliseconds, UserProfile, Channel, User
from chat.py2_3 import str_type, quote
from chat.settings import ALL_ROOM_ID, REDIS_PORT, GIPHY_URL, GIPHY_REGEX, FIREBASE_URL, REDIS_HOST, \
	REDIS_DB
from chat.tornado.constants import VarNames, HandlerNames, Actions, RedisPrefix, WebRtcRedisStates, \
	UserSettingsVarNames, UserProfileVarNames
from chat.tornado.message_creator import WebRtcMessageCreator, MessagesCreator
from chat.utils import get_max_key, validate_edit_message, \
	get_message_images_videos, update_symbols, up_files_to_img, evaluate, check_user, http_client

# from pywebpush import webpush

parent_logger = logging.getLogger(__name__)
base_logger = logging.LoggerAdapter(parent_logger, {
	'id': 0,
	'ip': '000.000.000.000'
})

# TODO https://github.com/leporo/tornado-redis#connection-pool-support
# CONNECTION_POOL = tornadoredis.ConnectionPool(
# max_connections=500,
# wait_for_available=True)

GIPHY_API_KEY = getattr(settings, "GIPHY_API_KEY", None)
FIREBASE_API_KEY = getattr(settings, "FIREBASE_API_KEY", None)


class MessagesHandler():

	def __init__(self, *args, **kwargs):
		self.closed_channels = None
		self.message_creator = WebRtcMessageCreator(None, None)
		super(MessagesHandler, self).__init__()
		self.webrtc_ids = {}
		self.id = None  # child init
		self.last_client_ping = 0
		self.user_id = 0  # anonymous by default
		self.ip = None
		from chat import global_redis
		self.async_redis_publisher = global_redis.async_redis_publisher
		self.sync_redis = global_redis.sync_redis
		self.channels = []
		self._logger = None
		self.async_redis = Client(host=REDIS_HOST, port=REDIS_PORT, selected_db=REDIS_DB)
		self.patch_tornadoredis()
		# input websocket messages handlers
		# The handler is determined by @VarNames.EVENT
		self.process_ws_message = {
			Actions.GET_MESSAGES: self.process_get_messages,
			Actions.GET_MESSAGES_BY_IDS: self.process_get_messages_by_ids,
			Actions.PRINT_MESSAGE: self.process_send_message,
			Actions.DELETE_ROOM: self.delete_room,
			Actions.EDIT_MESSAGE: self.edit_message,
			Actions.CREATE_ROOM: self.create_new_room,
			Actions.CREATE_CHANNEL: self.create_new_channel,
			Actions.SAVE_CHANNEL_SETTINGS: self.save_channels_settings,
			Actions.SAVE_ROOM_SETTINGS: self.save_room_settings,
			Actions.DELETE_CHANNEL: self.delete_channel,
			Actions.SET_USER_PROFILE: self.profile_save_user,
			Actions.SET_SETTINGS: self.profile_save_settings,
			Actions.INVITE_USER: self.invite_user,
			Actions.PING: self.respond_ping,
			Actions.PONG: self.process_pong_message
		}
		# Handlers for redis messages, if handler returns true - message won't be sent to client
		# The handler is determined by @VarNames.EVENT
		self.process_pubsub_message = {
			Actions.CREATE_ROOM: self.send_client_new_channel,
			Actions.DELETE_ROOM: self.send_client_delete_channel,
			Actions.INVITE_USER: self.send_client_new_channel,
			Actions.ADD_INVITE: self.send_client_new_channel,
			Actions.PING: self.process_ping_message,
		}

	def patch_tornadoredis(self):  # TODO remove this
		fabric = type(self.async_redis.connection.readline)
		self.async_redis.connection.old_read = self.async_redis.connection.readline

		def new_read(new_self, callback=None):
			try:
				return new_self.old_read(callback=callback)
			except Exception as e:
				return
				current_online = self.get_online_from_redis()
				self.logger.error(e)
				self.logger.error(
					"Exception info: "
					"self.id: %s ;;; "
					"self.connected = '%s';;; "
					"Redis default channel online = '%s';;; "
					"self.channels = '%s';;; "
					"self.closed_channels  = '%s';;;",
					self.id, self.connected, current_online, self.channels, self.closed_channels
				)
				raise e

		self.async_redis.connection.readline = fabric(new_read, self.async_redis.connection)

	@property
	def channel(self):
		return RedisPrefix.generate_user(self.user_id)

	@property
	def connected(self):
		raise NotImplemented

	@connected.setter
	def connected(self, value):
		raise NotImplemented

	@gen.engine
	def listen(self, channels):
		yield Task(
			self.async_redis.subscribe, channels)
		self.async_redis.listen(self.on_pub_sub_message)

	@property
	def logger(self):
		return self._logger if self._logger else base_logger

	@gen.engine
	def add_channel(self, channel):
		self.channels.append(channel)
		yield Task(self.async_redis.subscribe, (channel,))

	def get_online_from_redis(self):
		return self.get_online_and_status_from_redis()[1]

	def get_dict_users_from_redis(self):
		online = self.sync_redis.ssmembers(RedisPrefix.ONLINE_VAR)
		self.logger.debug('!! redis online: %s', online)
		result = self.parse_redis_online_into_dict_set(online) if online else {}
		return result

	@staticmethod
	def parse_redis_online_into_dict_set(online):
		"""
		:rtype : Dict[int, set]
		"""
		result = {}
		for decoded in online:  # py2 iteritems
			user_id = decoded.split(':')[0]
			result.setdefault(int(user_id), []).append(decoded)
		return result

	def get_online_and_status_from_redis(self):
		"""
		:rtype : (bool, list)
		"""
		online = self.sync_redis.ssmembers(RedisPrefix.ONLINE_VAR)
		self.logger.debug('!! redis online: %s', online)
		return self.parse_redis_online(online) if online else (False, [])

	def parse_redis_online(self, online):
		"""
		:rtype : (bool, list)
		"""
		result = set()
		user_is_online = False
		for decoded in online:  # py2 iteritems
			user_id = int(decoded.split(':')[0])
			if user_id == self.user_id and decoded != self.id:
				user_is_online = True
			result.add(user_id)
		return user_is_online, list(result)

	def publish(self, message, channel, parsable=False):
		jsoned_mess = encode_message(message, parsable)
		self.raw_publish(jsoned_mess, channel)

	def raw_publish(self, jsoned_mess, channel):
		self.logger.debug('<%s> %s', channel, jsoned_mess)
		self.async_redis_publisher.publish(channel, jsoned_mess)

	def on_pub_sub_message(self, message):
		"""
		All pubsub messages are automatically sent to client.
		:param message:
		:return:
		"""
		data = message.body
		if isinstance(data, str_type):  # not subscribe event
			prefixless_str = remove_parsable_prefix(data)
			if prefixless_str:
				dict_message = json.loads(prefixless_str)
				res = self.process_pubsub_message[dict_message[VarNames.EVENT]](dict_message)
				if not res:
					self.ws_write(prefixless_str)
			else:
				self.ws_write(data)

	def ws_write(self, message):
		raise NotImplementedError('WebSocketHandler implements')

	def search_giphy(self, message, query, cb):
		self.logger.debug("!! Asking giphy for: %s", query)
		def on_giphy_reply(response):
			try:
				self.logger.debug("!! Got giphy response: " + str(response.body))
				res =  json.loads(response.body)
				giphy = res['data'][0]['images']['downsized_medium']['url']
			except:
				giphy = None
			cb(message, giphy)
		url = GIPHY_URL.format(GIPHY_API_KEY, quote(query, safe=''))
		http_client.fetch(url, callback=on_giphy_reply)

	def notify_offline(self, channel, message_id):
		if FIREBASE_API_KEY is None:
			return
		online = self.get_online_from_redis()
		if channel == ALL_ROOM_ID:
			return
		offline_users = RoomUsers.objects.filter(room_id=channel, notifications=True).exclude(user_id__in=online).values_list('user_id')
		subscriptions = Subscription.objects.filter(user__in=offline_users, inactive=False)
		if len(subscriptions) == 0:
			return
		new_sub_mess =[SubscriptionMessages(message_id=message_id, subscription_id=r.id) for r in subscriptions]
		reg_ids =[r.registration_id for r in subscriptions]
		SubscriptionMessages.objects.bulk_create(new_sub_mess)
		self.post_firebase(list(reg_ids))

	def post_firebase(self, reg_ids):
		def on_reply(response):
			try:
				self.logger.debug("!! FireBase response: " + str(response.body))
				response_obj = json.loads(response.body)
				delete = []
				for index, elem in enumerate(response_obj['results']):
					if elem.get('error') in ['NotRegistered', 'InvalidRegistration']:
						delete.append(reg_ids[index])
				if len(delete) > 0:
					self.logger.info("Deactivating subscriptions: %s", delete)
					Subscription.objects.filter(registration_id__in=delete).update(inactive=True)
			except Exception as e:
				self.logger.error("Unable to parse response" + str(e))
				pass

		headers = {"Content-Type": "application/json", "Authorization": "key=%s" % FIREBASE_API_KEY}
		body = json.dumps({"registration_ids": reg_ids})
		self.logger.debug("!! post_fire_message %s", body)

		# TODO
		# webpush(subscription_info,
		# 		  data,
		# 		  vapid_private_key="Private Key or File Path[1]",
		# 		  vapid_claims={"sub": "mailto:YourEmailAddress"})

		r = HTTPRequest(FIREBASE_URL, method="POST", headers=headers, body=body)
		http_client.fetch(r, callback=on_reply)

	def isGiphy(self, content):
		if GIPHY_API_KEY is not None and content is not None:
			giphy_match = re.search(GIPHY_REGEX, content)
			return giphy_match.group(1) if giphy_match is not None else None

	def process_send_message(self, message):
		"""
		:type message: dict
		"""
		content = message.get(VarNames.CONTENT)
		giphy_match = self.isGiphy(content)

		# @transaction.atomic mysql has gone away
		def send_message(message, giphy=None):
			if message[VarNames.TIME_DIFF] < 0:
				raise ValidationError("Back to the future?")
			files = UploadedFile.objects.filter(id__in=message.get(VarNames.FILES), user_id=self.user_id)
			symbol = get_max_key(files)
			channel = message[VarNames.ROOM_ID]
			js_id = message[VarNames.JS_MESSAGE_ID]
			parent_message_id = message[VarNames.PARENT_MESSAGE]
			if parent_message_id:
				parent_room_id = Message.objects.get(id=parent_message_id).room_id
				if parent_room_id not in self.channels:
					raise ValidationError("You don't have access to this room message")
			message_db = Message(
				sender_id=self.user_id,
				content=message[VarNames.CONTENT],
				symbol=symbol,
				parent_message_id=parent_message_id,
				giphy=giphy,
				room_id=channel
			)
			message_db.time -= message[VarNames.TIME_DIFF]
			res_files = []
			message_db.save()
			if files:
				images = up_files_to_img(files, message_db.id)
				res_files = MessagesCreator.prepare_img_video(images, message_db.id)
			prepared_message = self.message_creator.create_send_message(
				message_db,
				Actions.PRINT_MESSAGE,
				res_files,
			)
			prepared_message[VarNames.JS_MESSAGE_ID] = js_id
			self.publish(prepared_message, channel)
			self.notify_offline(channel, message_db.id)
		if giphy_match is not None:
			self.search_giphy(message, giphy_match, send_message)
		else:
			send_message(message)

	def save_channels_settings(self, message):
		channel_id = message[VarNames.CHANNEL_ID]
		channel_name = message[VarNames.CHANNEL_NAME]
		new_creator = message[VarNames.CHANNEL_CREATOR_ID]
		if not channel_name or len(channel_name) > 16:
			raise ValidationError('Incorrect channel name name "{}"'.format(channel_name))
		channel = Channel.objects.get(id=channel_id)
		users_id = list(RoomUsers.objects.filter(room__channel_id=channel_id).values_list('user_id', flat=True))
		if channel.creator_id != self.user_id and self.user_id not in users_id:
			raise ValidationError("You are not allowed to edit this channel")
		if new_creator != channel.creator_id:
			if self.user_id != channel.creator_id:
				raise ValidationError("Only admin can change the admin of this channel")
			if new_creator not in users_id:
				raise ValidationError("You can only change admin to one of the users in this channels room")
			channel.creator_id = new_creator
		if self.user_id not in users_id: # if channel has no rooms
			users_id.append(self.user_id)
		channel.name = channel_name
		channel.save()
		m = {
			VarNames.EVENT: Actions.SAVE_CHANNEL_SETTINGS,
			VarNames.CHANNEL_ID: channel_id,
			VarNames.CB_BY_SENDER: self.id,
			VarNames.HANDLER_NAME: HandlerNames.ROOM,
			VarNames.CHANNEL_NAME: channel_name,
			VarNames.CHANNEL_CREATOR_ID: channel.creator_id,
			VarNames.TIME: get_milliseconds(),
			VarNames.JS_MESSAGE_ID: message[VarNames.JS_MESSAGE_ID],
		}
		for user_id in users_id:
			self.publish(m, RedisPrefix.generate_user(user_id))

	def create_new_channel(self, message):
		channel_name = message.get(VarNames.CHANNEL_NAME)
		if not channel_name or len(channel_name) > 16:
			raise ValidationError('Incorrect channel name name "{}"'.format(channel_name))

		channel = Channel(name=channel_name, creator_id=self.user_id)
		channel.save()
		channel_id = channel.id
		m = {
			VarNames.EVENT: Actions.CREATE_CHANNEL,
			VarNames.CHANNEL_ID: channel_id,
			VarNames.CHANNEL_CREATOR_ID: channel.creator_id,
			VarNames.CB_BY_SENDER: self.id,
			VarNames.HANDLER_NAME: HandlerNames.ROOM,
			VarNames.CHANNEL_NAME: channel_name,
			VarNames.TIME: get_milliseconds(),
			VarNames.JS_MESSAGE_ID: message[VarNames.JS_MESSAGE_ID],
		}
		self.publish(m, self.channel)
		
	def create_new_room(self, message):
		room_name = message.get(VarNames.ROOM_NAME)
		users = message.get(VarNames.ROOM_USERS)
		channel_id = message.get(VarNames.CHANNEL_ID)
		users.append(self.user_id)
		users = list(set(users))
		if room_name and len(room_name) > 16:
			raise ValidationError('Incorrect room name "{}"'.format(room_name))
		create_room = True
		if not room_name and len(users) == 2:
			user_rooms = evaluate(Room.users.through.objects.filter(user_id=self.user_id, room__name__isnull=True).values('room_id'))
			user_id = users[0] if users[1] == self.user_id else users[1]
			try:
				room = RoomUsers.objects.filter(user_id=user_id, room__in=user_rooms).values('room__id', 'room__disabled').get()
				room_id = room['room__id']
				if room['room__disabled']: # only a private room can be disabled
					Room.objects.filter(id=room_id).update(disabled=False, p2p=message[VarNames.P2P])
					RoomUsers.objects.filter(
						user_id=self.user_id,
						room_id=room_id
					).update(
						volume=message[VarNames.VOLUME],
						notifications=message[VarNames.NOTIFICATIONS]
					)
				else:
					raise ValidationError('This room already exist')
				create_room = False
			except RoomUsers.DoesNotExist:
				pass
		elif not room_name:
			raise ValidationError('At least one user should be selected, or room should be public')

		if channel_id and channel_id not in self.get_users_channels_ids():
			raise ValidationError("You don't have access to this channel")
		if channel_id:
			channel = Channel.objects.get(id=channel_id)
			channel_name = channel.name
			channel_creator_id = channel.creator_id
		else:
			channel_name = None
			channel_creator_id = None
		if create_room:
			room = Room(name=room_name, channel_id=channel_id, p2p=message[VarNames.P2P])
			if not room_name:
				room.creator_id = self.user_id
			room.save()
			room_id = room.id
			max_id = Message.objects.all().aggregate(Max('id'))['id__max']
			ru = [RoomUsers(
				user_id=user_id,
				room_id=room_id,
				last_read_message_id=max_id,
				volume=message[VarNames.VOLUME],
				notifications=message[VarNames.NOTIFICATIONS]
			) for user_id in users]
			RoomUsers.objects.bulk_create(ru)

		m = {
			VarNames.EVENT: Actions.CREATE_ROOM,
			VarNames.ROOM_ID: room_id,
			VarNames.ROOM_USERS: users,
			VarNames.CB_BY_SENDER: self.id,
			VarNames.INVITER_USER_ID: self.user_id,
			VarNames.HANDLER_NAME: HandlerNames.ROOM,
			VarNames.VOLUME: message[VarNames.VOLUME],
			VarNames.P2P: message[VarNames.P2P],
			VarNames.NOTIFICATIONS: message[VarNames.NOTIFICATIONS],
			VarNames.ROOM_NAME: room_name,
			VarNames.TIME: get_milliseconds(),
			VarNames.JS_MESSAGE_ID: message[VarNames.JS_MESSAGE_ID],
		}
		if channel_id:
			m[VarNames.CHANNEL_NAME] = channel_name
			m[VarNames.CHANNEL_ID] = channel_id
			m[VarNames.CHANNEL_CREATOR_ID] = channel_creator_id
		jsoned_mess = encode_message(m, True)
		for user in users:
			self.raw_publish(jsoned_mess, RedisPrefix.generate_user(user))

	def save_room_settings(self, message):
		"""
		POST only, validates email during registration
		"""
		room_id = message[VarNames.ROOM_ID]
		room_name = message[VarNames.ROOM_NAME]
		creator_id = message.get(VarNames.ROOM_CREATOR_ID) # will be none for private room
		updated = RoomUsers.objects.filter(room_id=room_id, user_id=self.user_id).update(
			volume=message[VarNames.VOLUME],
			notifications=message[VarNames.NOTIFICATIONS]
		)
		if updated != 1:
			raise ValidationError("You don't have access to this room")
		room = Room.objects.get(id=room_id)
		update_all = False
		if not room.name:
			if room.p2p != message[VarNames.P2P]:
				room.p2p = message[VarNames.P2P]
				update_all = True
		elif room_id != settings.ALL_ROOM_ID:
			if room_name != room.name:
				room.name = room_name
				update_all = True

			if room.channel_id != message[VarNames.CHANNEL_ID]:
				room.channel_id = message[VarNames.CHANNEL_ID]
				if room.channel_id and room.channel_id not in self.get_users_channels_ids():
					raise ValidationError("You don't have access to this channel")
				update_all = True
			if creator_id != room.creator_id:
				if room.creator_id != self.user_id:
					raise ValidationError("Only an owner of this room can change its admin")
				users_id = RoomUsers.objects.filter(room_id=room.id).values_list('user_id', flat=True)
				if creator_id not in users_id:
					raise ValidationError("You can only change admin to one of the users in this channels room")
				room.creator_id = creator_id
				update_all = True
		if message.get(VarNames.CHANNEL_ID): # will be nOne for private room
			channel = Channel.objects.get(id=message[VarNames.CHANNEL_ID])
			channel_name = channel.name
			channel_creator_id = channel.creator_id
		else:
			channel_name = None
			channel_creator_id = None
		if update_all:
			room.save()
			room_users = list(RoomUsers.objects.filter(room_id=room_id))
			for room_user in room_users:
				self.publish({
					VarNames.EVENT: Actions.SAVE_ROOM_SETTINGS,
					VarNames.CHANNEL_ID: room.channel_id,
					VarNames.CB_BY_SENDER: self.id,
					VarNames.HANDLER_NAME: HandlerNames.ROOM,
					VarNames.CHANNEL_NAME: channel_name,
					VarNames.CHANNEL_CREATOR_ID: channel_creator_id,
					VarNames.ROOM_CREATOR_ID: room.creator_id,
					VarNames.ROOM_ID: room.id,
					VarNames.VOLUME: room_user.volume,
					VarNames.NOTIFICATIONS: room_user.notifications,
					VarNames.P2P: message[VarNames.P2P],
					VarNames.ROOM_NAME: room_name,
					VarNames.TIME: get_milliseconds(),
					VarNames.JS_MESSAGE_ID: message[VarNames.JS_MESSAGE_ID],
				}, RedisPrefix.generate_user(room_user.user_id))
		else:
			self.publish({
				VarNames.EVENT: Actions.SAVE_ROOM_SETTINGS,
				VarNames.CHANNEL_ID: room.channel_id,
				VarNames.CB_BY_SENDER: self.id,
				VarNames.CHANNEL_CREATOR_ID: channel_creator_id,
				VarNames.ROOM_CREATOR_ID: room.creator_id,
				VarNames.HANDLER_NAME: HandlerNames.ROOM,
				VarNames.CHANNEL_NAME: channel_name,
				VarNames.ROOM_ID: room.id,
				VarNames.VOLUME: message[VarNames.VOLUME],
				VarNames.NOTIFICATIONS: message[VarNames.NOTIFICATIONS],
				VarNames.P2P: message[VarNames.P2P],
				VarNames.ROOM_NAME: room_name,
				VarNames.TIME: get_milliseconds(),
				VarNames.JS_MESSAGE_ID: message[VarNames.JS_MESSAGE_ID],
			}, self.channel)

	def get_users_channels_ids(self):
		channels_ids = Room.objects.filter(users__id=self.user_id, disabled=False).values_list('channel_id', flat=True)
		return Channel.objects.filter(Q(id__in=channels_ids) | Q(creator=self.user_id), disabled=False).values_list('id', flat=True)

	def profile_save_settings(self, in_message):
		message = in_message[VarNames.CONTENT]
		UserProfile.objects.filter(id=self.user_id).update(
			suggestions=message[UserSettingsVarNames.SUGGESTIONS],
			embedded_youtube=message[UserSettingsVarNames.EMBEDDED_YOUTUBE],
			highlight_code=message[UserSettingsVarNames.HIGHLIGHT_CODE],
			message_sound=message[UserSettingsVarNames.MESSAGE_SOUND],
			incoming_file_call_sound=message[UserSettingsVarNames.INCOMING_FILE_CALL_SOUND],
			online_change_sound=message[UserSettingsVarNames.ONLINE_CHANGE_SOUND],
			logs=message[UserSettingsVarNames.LOGS],
			send_logs=message[UserSettingsVarNames.SEND_LOGS],
			theme=message[UserSettingsVarNames.THEME],
		)
		self.publish(self.message_creator.set_settings(in_message[VarNames.JS_MESSAGE_ID], message), self.channel)

	def profile_save_user(self, in_message):
		message = in_message[VarNames.CONTENT]
		userprofile = UserProfile.objects.get(id=self.user_id)
		un = message[UserProfileVarNames.USERNAME]
		if userprofile.username != un:
			check_user(un)

		sex = message[UserProfileVarNames.SEX]
		UserProfile.objects.filter(id=self.user_id).update(
			username=un,
			name=message[UserProfileVarNames.NAME],
			city=message[UserProfileVarNames.CITY],
			surname=message[UserProfileVarNames.SURNAME],
			birthday=message[UserProfileVarNames.BIRTHDAY],
			contacts=message[UserProfileVarNames.CONTACTS],
			sex=settings.GENDERS_STR[sex],
		)
		self.publish(self.message_creator.set_user_profile(in_message[VarNames.JS_MESSAGE_ID], message), self.channel)
		if userprofile.sex_str != sex or userprofile.username != un:
			self.publish(self.message_creator.changed_user_profile(sex, self.user_id, un), settings.ALL_ROOM_ID)

	def profile_save_image(self, request):
		pass
		# UserProfile.objects.filter(id=request.user.id).update(
		# 	suggestions=request.POST['suggestions'],
		# 	embedded_youtube=request.POST['embedded_youtube'],
		# 	highlight_code=request.POST['highlight_code'],
		# 	message_sound=request.POST['message_sound'],
		# 	incoming_file_call_sound=request.POST['incoming_file_call_sound'],
		# 	online_change_sound=request.POST['online_change_sound'],
		# 	logs=request.POST['logs'],
		# 	send_logs=request.POST['send_logs'],
		# 	theme=request.POST['theme'],
		# )
		# return HttpResponse(settings.VALIDATION_IS_OK, content_type='text/plain')

	def invite_user(self, message):
		room_id = message[VarNames.ROOM_ID]
		if room_id not in self.channels:
			raise ValidationError("Access denied, only allowed for channels {}".format(self.channels))
		room = Room.objects.get(id=room_id)
		if room.is_private:
			raise ValidationError("You can't add users to direct room, create a new room instead")
		users = message.get(VarNames.ROOM_USERS)
		users_in_room = list(RoomUsers.objects.filter(room_id=room_id).values_list('user_id', flat=True))
		intersect = set(users_in_room) & set(users)
		if bool(intersect):
			raise ValidationError("Users %s are already in the room", intersect)
		users_in_room.extend(users)

		max_id = Message.objects.filter(room_id=room_id).aggregate(Max('id'))['id__max']
		if not max_id:
			max_id = Message.objects.all().aggregate(Max('id'))['id__max']
		ru = [RoomUsers(
			user_id=user_id,
			room_id=room_id,
			last_read_message_id=max_id,
			volume=1,
			notifications=False
		) for user_id in users]
		RoomUsers.objects.bulk_create(ru)

		add_invitee = {
			VarNames.EVENT: Actions.ADD_INVITE,
			VarNames.ROOM_ID: room_id,
			VarNames.ROOM_USERS: users_in_room,
			VarNames.ROOM_NAME: room.name,
			VarNames.INVITEE_USER_ID: users,
			VarNames.INVITER_USER_ID: self.user_id,
			VarNames.HANDLER_NAME: HandlerNames.ROOM,
			VarNames.TIME: get_milliseconds(),
			VarNames.VOLUME: 1,
			VarNames.NOTIFICATIONS: False,
		}
		add_invitee_dumped = encode_message(add_invitee, True)
		for user in users:
			self.raw_publish(add_invitee_dumped, RedisPrefix.generate_user(user))

		invite = {
			VarNames.EVENT: Actions.INVITE_USER,
			VarNames.ROOM_ID: room_id,
			VarNames.INVITEE_USER_ID: users,
			VarNames.INVITER_USER_ID: self.user_id,
			VarNames.HANDLER_NAME: HandlerNames.ROOM,
			VarNames.ROOM_USERS: users_in_room,
			VarNames.TIME: get_milliseconds(),
			VarNames.CB_BY_SENDER: self.id,
			VarNames.JS_MESSAGE_ID: message[VarNames.JS_MESSAGE_ID]
		}
		self.publish(invite, room_id, True)

	def respond_ping(self, message):
		self.ws_write(self.message_creator.responde_pong(message[VarNames.JS_MESSAGE_ID]))

	def process_pong_message(self, message):
		self.last_client_ping = message[VarNames.TIME]

	def process_ping_message(self, message):
		def call_check():
			if message[VarNames.TIME] != self.last_client_ping:
				self.close(408, "Ping timeout")
		IOLoop.instance().call_later(settings.PING_CLOSE_SERVER_DELAY, call_check)

	def delete_channel(self, message):
		channel_id = message[VarNames.CHANNEL_ID]
		channel = Channel.objects.get(id=channel_id)
		if channel.creator_id != self.user_id:
			raise ValidationError(f"Only admin can delete this channel. Please ask ${User.objects.get(id=channel.creator_id).username}")
		# if Room.objects.filter(channel_id=channel_id).count() > 0:
		users_id = list(RoomUsers.objects.filter(room__channel_id=channel_id).values_list('user_id', flat=True))
		if len(users_id) > 0:
			raise ValidationError(f"Some users are still in the rooms on this channel Please ask them to leave")
		Room.objects.filter(channel_id=channel_id).update(disabled=True)
		channel.disabled = True
		channel.save()

		message = {
			VarNames.EVENT: Actions.DELETE_CHANNEL,
			VarNames.CHANNEL_ID: channel_id,
			VarNames.HANDLER_NAME: HandlerNames.ROOM,
			VarNames.TIME: get_milliseconds(),
			VarNames.CB_BY_SENDER: self.id,
			VarNames.JS_MESSAGE_ID: message[VarNames.JS_MESSAGE_ID]
		}
		self.publish(message, self.channel)

	def delete_room(self, message):
		room_id = message[VarNames.ROOM_ID]
		js_id = message[VarNames.JS_MESSAGE_ID]
		if room_id not in self.channels or room_id == ALL_ROOM_ID:
			raise ValidationError('You are not allowed to exit this room')
		room = Room.objects.get(id=room_id)
		if room.disabled:
			raise ValidationError('Room is already deleted')
		if room.name is None:  # if private then disable
			room.disabled = True
			room.save()
		else:  # if public -> leave the room, delete the link
			RoomUsers.objects.filter(room_id=room.id, user_id=self.user_id).delete()
		ru = list(RoomUsers.objects.filter(room_id=room.id).values_list('user_id', flat=True))
		message = self.message_creator.unsubscribe_direct_message(room_id, js_id, self.id, ru, room.name)
		self.publish(message, room_id, True)

	def edit_message(self, data):
		message = Message.objects.get(id=data[VarNames.MESSAGE_ID])
		validate_edit_message(self.user_id, message)
		message.content = data[VarNames.CONTENT]
		MessageHistory(message=message, content=message.content, giphy=message.giphy).save()
		message.edited_times += 1
		giphy_match = self.isGiphy(data[VarNames.CONTENT])
		if message.content is None:
			Message.objects.filter(id=data[VarNames.MESSAGE_ID]).update(
				deleted=True,
				edited_times=message.edited_times,
				content=None
			)
			self.publish(self.message_creator.create_send_message(message, Actions.DELETE_MESSAGE, None), message.room_id)
		elif giphy_match is not None:
			self.edit_message_giphy(giphy_match, message)
		else:
			self.edit_message_edit(data, message)

	def edit_message_giphy(self, giphy_match, message):
		def edit_glyphy(message, giphy):
			Message.objects.filter(id=message.id).update(
				content=message.content,
				symbol=message.symbol,
				giphy=giphy,
				edited_times=message.edited_times
			)
			message.giphy = giphy
			self.publish(self.message_creator.create_send_message(message, Actions.EDIT_MESSAGE, None), message.room_id)

		self.search_giphy(message, giphy_match, edit_glyphy)

	def edit_message_edit(self, data, message):
		action = Actions.EDIT_MESSAGE
		message.giphy = None
		files = UploadedFile.objects.filter(id__in=data.get(VarNames.FILES), user_id=self.user_id)
		if files:
			update_symbols(files, message)
			up_files_to_img(files, message.id)
		if message.symbol:  # fetch all, including that we just store
			db_images = Image.objects.filter(message_id=message.id)
			prep_files = MessagesCreator.prepare_img_video(db_images, message.id)
		else:
			prep_files = None
		Message.objects.filter(id=message.id).update(content=message.content, symbol=message.symbol, giphy=None, edited_times=message.edited_times)
		self.publish(self.message_creator.create_send_message(message, action, prep_files), message.room_id)

	def send_client_new_channel(self, message):
		room_id = message[VarNames.ROOM_ID]
		self.add_channel(room_id)

	def send_client_delete_channel(self, message):
		room_id = message[VarNames.ROOM_ID]
		if message[VarNames.USER_ID] == self.user_id or message[VarNames.ROOM_NAME] is None:
			self.async_redis.unsubscribe((room_id,))
			self.channels.remove(room_id)
			channels = {
				VarNames.EVENT: Actions.DELETE_MY_ROOM,
				VarNames.ROOM_ID: room_id,
				VarNames.HANDLER_NAME: HandlerNames.ROOM,
				VarNames.JS_MESSAGE_ID: message[VarNames.JS_MESSAGE_ID],
			}
			self.ws_write(channels)
		else:
			self.ws_write({
				VarNames.EVENT: Actions.USER_LEAVES_ROOM,
				VarNames.ROOM_ID: room_id,
				VarNames.USER_ID: message[VarNames.USER_ID],
				VarNames.ROOM_USERS: message[VarNames.ROOM_USERS],
				VarNames.HANDLER_NAME: HandlerNames.ROOM
			})
		return True

	def process_get_messages_by_ids(self, data):
		"""
		:type data: dict
		"""
		ids = data[VarNames.GET_MESSAGES_MESSAGES_IDS]
		room_id = data[VarNames.ROOM_ID]
		messages = Message.objects.filter(room_id=room_id, id__in=ids)
		imv = get_message_images_videos(messages)
		response = self.message_creator.get_messages(messages, room_id, imv, MessagesCreator.prepare_img_video, data[VarNames.JS_MESSAGE_ID])
		self.ws_write(response)

	def process_get_messages(self, data):
		"""
		:type data: dict
		"""
		exclude_ids = data[VarNames.EXCLUDE_IDS]
		# this method needs to accept ids of message, because messages on the client can be not-ordered
		# lets say we loaded a message for a thread , so it's single
		# or someone joined from offline and he synced message in the top.
		thread_id = data[VarNames.THREAD_ID]
		room_id = data[VarNames.ROOM_ID]
		if thread_id:
			messages = Message.objects.filter(room_id=room_id, parent_message__id=thread_id)
		else:
			count = int(data.get(VarNames.GET_MESSAGES_COUNT, 10))
			if count > 100:
				raise ValidationError("Can't load that many messages")
			messages = Message.objects.filter(
				Q(room_id=room_id) & Q(parent_message__id=thread_id) & ~Q(id__in=exclude_ids)
			).order_by('-pk')[:count]

		imv = get_message_images_videos(messages)
		response = self.message_creator.get_messages(messages, room_id, imv, MessagesCreator.prepare_img_video, data[VarNames.JS_MESSAGE_ID])
		self.ws_write(response)


class WebRtcMessageHandler(MessagesHandler):

	def __init__(self, *args, **kwargs):
		super(WebRtcMessageHandler, self).__init__(*args, **kwargs)
		self.process_ws_message.update({
			Actions.WEBRTC: self.proxy_webrtc,
			Actions.CLOSE_FILE_CONNECTION: self.close_file_connection,
			Actions.CLOSE_CALL_CONNECTION: self.close_call_connection,
			Actions.CANCEL_CALL_CONNECTION: self.cancel_call_connection,
			Actions.ACCEPT_CALL: self.accept_call,
			Actions.JOIN_CALL: self.join_call,
			Actions.ACCEPT_FILE: self.accept_file,
			Actions.OFFER_FILE_CONNECTION: self.offer_webrtc_connection,
			Actions.OFFER_CALL_CONNECTION: self.offer_webrtc_connection,
			Actions.OFFER_P2P_CONNECTION: self.offer_webrtc_message_connection,
			Actions.REPLY_FILE_CONNECTION: self.reply_file_connection,
			Actions.RETRY_FILE_CONNECTION: self.retry_file_connection,
			Actions.REPLY_CALL_CONNECTION: self.reply_call_connection,
			Actions.NOTIFY_CALL_ACTIVE: self.notify_call_active,
			Actions.SYNC_HISTORY: self.sync_history,
		})
		self.process_pubsub_message.update({
			Actions.OFFER_FILE_CONNECTION: self.set_opponent_call_channel,
			Actions.OFFER_CALL_CONNECTION: self.set_opponent_call_channel,
			Actions.OFFER_P2P_CONNECTION: self.set_opponent_p2p_channel,
			Actions.NOTIFY_CALL_ACTIVE: self.set_opponent_notify_call,
		})

	def set_opponent_notify_call(self, message):
		connection_id = message[VarNames.CONNECTION_ID]
		self.sync_redis.hset(connection_id, self.id, WebRtcRedisStates.OFFERED)

	def set_opponent_call_channel(self, message):
		connection_id = message[VarNames.CONNECTION_ID]
		if message[VarNames.WEBRTC_OPPONENT_ID] == self.id:
			return True
		self.sync_redis.hset(connection_id, self.id, WebRtcRedisStates.OFFERED)

	def set_opponent_p2p_channel(self, message):
		connection_id = message[VarNames.CONNECTION_ID]
		if message[VarNames.WEBRTC_OPPONENT_ID] == self.id:
			return True
		self.sync_redis.hset(connection_id, self.id, WebRtcRedisStates.READY)

	def create_webrtc_connection(self, in_message, connection_id):
		room_id = in_message[VarNames.ROOM_ID]
		content = in_message.get(VarNames.CONTENT)
		js_id = in_message[VarNames.JS_MESSAGE_ID]
		# use list because sets dont have 1st element which is offerer
		self.async_redis_publisher.hset(RedisPrefix.WEBRTC_CONNECTION, connection_id, self.id)
		self.async_redis_publisher.hset(connection_id, self.id, WebRtcRedisStates.READY)
		opponents_message = self.message_creator.offer_webrtc(content, connection_id, room_id, in_message[VarNames.EVENT], in_message.get(VarNames.THREAD_ID))
		self_message = self.message_creator.set_connection_id(js_id, connection_id)
		self.ws_write(self_message)
		self.logger.info('!! Offering a webrtc, connection_id %s', connection_id)
		self.publish(opponents_message, room_id, True)

	def offer_webrtc_message_connection(self, in_message):
		digits_format = "r{:0" + str(RedisPrefix.CONNECTION_ID_LENGTH-1) + "d}"
		connection_id = digits_format.format(in_message[VarNames.ROOM_ID])
		self.create_webrtc_connection(in_message, connection_id)

	def offer_webrtc_connection(self, in_message):
		connection_id = id_generator(RedisPrefix.CONNECTION_ID_LENGTH)
		self.create_webrtc_connection(in_message, connection_id)

	def retry_file_connection(self, in_message):
		connection_id = in_message[VarNames.CONNECTION_ID]
		opponent_ws_id = in_message[VarNames.WEBRTC_OPPONENT_ID]
		sender_ws_id = self.sync_redis.shget(RedisPrefix.WEBRTC_CONNECTION, connection_id)
		if sender_ws_id == self.id:
			self.publish(self.message_creator.retry_file(connection_id), opponent_ws_id)
		else:
			raise ValidationError("Invalid channel status.")

	def reply_file_connection(self, in_message):
		connection_id = in_message[VarNames.CONNECTION_ID]
		sender_ws_id = self.sync_redis.shget(RedisPrefix.WEBRTC_CONNECTION, connection_id)
		sender_ws_status = self.sync_redis.shget(connection_id, sender_ws_id)
		self_ws_status = self.sync_redis.shget(connection_id, self.id)
		if sender_ws_status == WebRtcRedisStates.READY and self_ws_status == WebRtcRedisStates.OFFERED:
			self.async_redis_publisher.hset(connection_id, self.id, WebRtcRedisStates.RESPONDED)
			self.publish(self.message_creator.reply_webrtc(
				Actions.REPLY_FILE_CONNECTION,
				connection_id,
				HandlerNames.WEBRTC_TRANSFER.format(connection_id),
				in_message[VarNames.CONTENT]
			), sender_ws_id)
		else:
			raise ValidationError("Invalid channel status.")

	def sync_history(self, in_message):
		room_ids = list(map(lambda d: d['roomId'], in_message[VarNames.CONTENT]))
		if not set(room_ids).issubset(self.channels):
			raise ValidationError("This is not a messages in the room you are in")

		messages_ids_dict = {}  # dict where key is messageId, and value is edited times
		for l in in_message[VarNames.CONTENT]:
			messages_ids_dict.update(l[VarNames.MESSAGE_IDS])
		messages_ids = [*messages_ids_dict] # get messages id arrays string[]
		exclude_messages_ids = []
		existing_messages = Message.objects.filter(id__in=messages_ids).values('id', 'edited_times')
		for existing_mes in existing_messages:
			if existing_mes['edited_times'] <= messages_ids_dict[str(existing_mes['id'])]: # python dict keys are str
				exclude_messages_ids.append(existing_mes['id'])
		messages = Message.objects.filter(
			Q(room_id__in=room_ids)
			& ~Q(id__in=messages_ids)
			& Q(time__gt=get_milliseconds() - in_message[VarNames.LAST_SYNCED])
		)
		content = MessagesCreator.message_model_to_dto(messages)
		self.ws_write({
			VarNames.CONTENT: content,
			VarNames.JS_MESSAGE_ID: in_message[VarNames.JS_MESSAGE_ID],
			VarNames.HANDLER_NAME: HandlerNames.NULL
		})

	def notify_call_active(self, in_message):
		# check connectionid , roomId is checked on_message
		if in_message[VarNames.CONNECTION_ID]:
			self_channel_status = self.sync_redis.shget(in_message[VarNames.CONNECTION_ID], self.id)
			if self_channel_status not in [WebRtcRedisStates.READY, WebRtcRedisStates.OFFERED, WebRtcRedisStates.RESPONDED]:
				raise ValidationError(f"Invalid status to to send this message {self_channel_status}")
		self.publish({
			VarNames.ROOM_ID: in_message[VarNames.ROOM_ID],
			VarNames.CONNECTION_ID: in_message[VarNames.CONNECTION_ID],
			VarNames.EVENT: in_message[VarNames.EVENT],
			VarNames.HANDLER_NAME: HandlerNames.WEBRTC,
			VarNames.WEBRTC_OPPONENT_ID: self.id,
			VarNames.USER_ID: self.user_id
		}, in_message[VarNames.WEBRTC_OPPONENT_ID], True)

	def reply_call_connection(self, in_message):
		self.send_call_answer(
			in_message,
			WebRtcRedisStates.RESPONDED,
			Actions.REPLY_CALL_CONNECTION,
			[WebRtcRedisStates.OFFERED],
			HandlerNames.WEBRTC_TRANSFER
		)

	def proxy_webrtc(self, in_message):
		"""
		:type in_message: dict
		"""
		connection_id = in_message[VarNames.CONNECTION_ID]
		channel = in_message.get(VarNames.WEBRTC_OPPONENT_ID)
		self_channel_status = self.sync_redis.shget(connection_id, self.id)
		opponent_channel_status = self.sync_redis.shget(connection_id, channel)
		if not (self_channel_status == WebRtcRedisStates.READY and opponent_channel_status == WebRtcRedisStates.READY):
			raise ValidationError('Error in connection status, your status is {} while opponent is {}'.format(
				self_channel_status, opponent_channel_status
			))  # todo receiver should only accept proxy_webrtc from sender, sender can accept all
		# I mean somebody if there're 3 ppl in 1 channel and first is initing transfer to 2nd and 3rd,
		# 2nd guy can fraud 3rd guy webrtc traffic, which is allowed during the call, but not while transering file
		in_message[VarNames.HANDLER_NAME] = HandlerNames.PEER_CONNECTION.format(connection_id, self.id)
		self.logger.debug(
			"!! Forwarding message to channel %s, self %s, other status %s",
			channel,
			self_channel_status,
			opponent_channel_status
		)
		self.publish(in_message, channel)

	def close_file_connection(self, in_message):
		connection_id = in_message[VarNames.CONNECTION_ID]
		opponent_id = in_message.get(VarNames.WEBRTC_OPPONENT_ID, None)
		self_channel_status = self.sync_redis.shget(connection_id, self.id)
		if not self_channel_status:
			raise Exception("Access Denied")
		if self_channel_status != WebRtcRedisStates.CLOSED:
			sender_id = self.sync_redis.shget(RedisPrefix.WEBRTC_CONNECTION, connection_id)
			if sender_id == self.id:
				message = self.message_creator.get_close_file_sender_message(connection_id)
				self.async_redis_publisher.hset(connection_id, opponent_id, WebRtcRedisStates.CLOSED)
				self.publish(message, opponent_id)
			else:
				self.close_file_receiver(connection_id, in_message, sender_id)
				self.async_redis_publisher.hset(connection_id, self.id, WebRtcRedisStates.CLOSED)

	def close_call_connection(self, in_message):
		self.send_call_answer(
			in_message,
			WebRtcRedisStates.CLOSED,
			Actions.CLOSE_CALL_CONNECTION,
			[WebRtcRedisStates.READY, WebRtcRedisStates.RESPONDED],
			HandlerNames.PEER_CONNECTION
		)

	def cancel_call_connection(self, in_message):
		self.send_call_answer(
			in_message,
			WebRtcRedisStates.CLOSED,
			Actions.CANCEL_CALL_CONNECTION,
			[WebRtcRedisStates.OFFERED],
			HandlerNames.WEBRTC_TRANSFER
		)

	def close_file_receiver(self, connection_id, in_message, sender_id):
		sender_status = self.sync_redis.shget(connection_id, sender_id)
		if not sender_status:
			raise Exception("Access denied")
		if sender_status != WebRtcRedisStates.CLOSED:
			self.publish({
				VarNames.HANDLER_NAME:  HandlerNames.PEER_CONNECTION.format(in_message[VarNames.CONNECTION_ID], self.id),
				VarNames.EVENT: Actions.CLOSE_FILE_CONNECTION,
				VarNames.CONTENT: in_message[VarNames.CONTENT]
			}, sender_id)

	def accept_file(self, in_message):
		connection_id = in_message[VarNames.CONNECTION_ID]
		content = in_message[VarNames.CONTENT]
		sender_ws_id = self.sync_redis.shget(RedisPrefix.WEBRTC_CONNECTION, connection_id)
		sender_ws_status = self.sync_redis.shget(connection_id, sender_ws_id)
		self_ws_status = self.sync_redis.shget(connection_id, self.id)
		if sender_ws_status == WebRtcRedisStates.READY \
				and self_ws_status in [WebRtcRedisStates.RESPONDED, WebRtcRedisStates.READY]:
			self.async_redis_publisher.hset(connection_id, self.id, WebRtcRedisStates.READY)
			self.publish(self.message_creator.get_accept_file_message(connection_id, content), sender_ws_id)
		else:
			raise ValidationError("Invalid channel status")

	def accept_call(self, in_message):
		self.establish_response_connection(in_message, WebRtcRedisStates.RESPONDED)

	def join_call(self, in_message):
		self.establish_response_connection(in_message, WebRtcRedisStates.OFFERED)

	# todo
	# we can use channel_status = self.sync_redis.shgetall(connection_id)
	# and then self.async_redis_publisher.hset(connection_id, self.id, WebRtcRedisStates.READY)
	# if we shgetall and only then do async hset
	# we can catch an issue when 2 concurrent users accepted the call
	# but we didn't  send them ACCEPT_CALL as they both were in status 'offered'
	def establish_response_connection(self, in_message, allowed_status):
		connection_id = in_message[VarNames.CONNECTION_ID]
		self_status = self.sync_redis.shget(connection_id, self.id)
		if self_status != allowed_status:
			raise ValidationError("Invalid channel status")
		conn_users = self.sync_redis.shgetall(connection_id)
		self.publish_call_answer(
			conn_users,
			connection_id,
			HandlerNames.WEBRTC_TRANSFER,
			Actions.ACCEPT_CALL,
			WebRtcRedisStates.READY,
			{}
		)

	def send_call_answer(self, in_message, status_set, reply_action, allowed_state, message_handler):
		connection_id = in_message[VarNames.CONNECTION_ID]
		content = in_message.get(VarNames.CONTENT)  # cancel call can skip browser
		conn_users = self.sync_redis.shgetall(connection_id)
		if conn_users[self.id] in allowed_state:
			self.publish_call_answer(conn_users, connection_id, message_handler, reply_action, status_set, content)
		else:
			raise ValidationError("Invalid channel status.")

	def publish_call_answer(self, conn_users, connection_id, message_handler, reply_action, status_set, content):
		self.async_redis_publisher.hset(connection_id, self.id, status_set)
		del conn_users[self.id]
		message = self.message_creator.reply_webrtc(reply_action, connection_id, message_handler, content)
		for user in conn_users:
			if conn_users[user] != WebRtcRedisStates.CLOSED:
				self.publish(message, user)
