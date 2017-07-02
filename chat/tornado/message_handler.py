import json
import logging

from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.db.models import Q
from tornado.gen import engine, Task
from tornadoredis import Client

from chat.log_filters import id_generator
from chat.models import Message, Room, get_milliseconds, RoomUsers
from chat.py2_3 import str_type
from chat.settings import ALL_ROOM_ID, SELECT_SELF_ROOM, \
	TORNADO_REDIS_PORT, WEBRTC_CONNECTION
from chat.tornado.constants import VarNames, HandlerNames, Actions, RedisPrefix, WebRtcRedisStates
from chat.tornado.image_utils import process_images, prepare_img, save_images, get_message_images
from chat.tornado.message_creator import WebRtcMessageCreator
from chat.utils import get_max_key, execute_query, do_db, update_room

parent_logger = logging.getLogger(__name__)
base_logger = logging.LoggerAdapter(parent_logger, {
	'id': 0,
	'ip': '000.000.000.000'
})

# TODO https://github.com/leporo/tornado-redis#connection-pool-support
# CONNECTION_POOL = tornadoredis.ConnectionPool(
# max_connections=500,
# wait_for_available=True)


class MessagesHandler(WebRtcMessageCreator):

	def __init__(self, *args, **kwargs):
		self.closed_channels = None
		self.parsable_prefix = 'p'
		super(MessagesHandler, self).__init__(*args, **kwargs)
		self.webrtc_ids = {}
		self.ip = None
		from chat import global_redis
		self.async_redis_publisher = global_redis.async_redis_publisher
		self.sync_redis = global_redis.sync_redis
		self.channels = []
		self._logger = None
		self.async_redis = Client(port=TORNADO_REDIS_PORT)
		self.patch_tornadoredis()
		self.pre_process_message = {
			Actions.GET_MESSAGES: self.process_get_messages,
			Actions.SEND_MESSAGE: self.process_send_message,
			Actions.WEBRTC: self.proxy_webrtc,
			Actions.CLOSE_FILE_CONNECTION: self.close_file_connection,
			Actions.CLOSE_CALL_CONNECTION: self.close_call_connection,
			Actions.CANCEL_CALL_CONNECTION: self.cancel_call_connection,
			Actions.ACCEPT_CALL: self.accept_call,
			Actions.ACCEPT_FILE: self.accept_file,
			Actions.CREATE_DIRECT_CHANNEL: self.create_user_channel,
			Actions.DELETE_ROOM: self.delete_channel,
			Actions.EDIT_MESSAGE: self.edit_message,
			Actions.CREATE_ROOM_CHANNEL: self.create_new_room,
			Actions.INVITE_USER: self.invite_user,
			Actions.OFFER_FILE_CONNECTION: self.offer_webrtc_connection,
			Actions.OFFER_CALL_CONNECTION: self.offer_webrtc_connection,
			Actions.REPLY_FILE_CONNECTION: self.reply_file_connection,
			Actions.REPLY_CALL_CONNECTION: self.reply_call_connection,
		}
		self.post_process_message = {
			Actions.CREATE_DIRECT_CHANNEL: self.send_client_new_channel,
			Actions.CREATE_ROOM_CHANNEL: self.send_client_new_channel,
			Actions.DELETE_ROOM: self.send_client_delete_channel,
			Actions.INVITE_USER: self.send_client_new_channel,
			Actions.OFFER_FILE_CONNECTION: self.set_opponent_call_channel,
			Actions.OFFER_CALL_CONNECTION: self.set_opponent_call_channel
		}

	def patch_tornadoredis(self):  # TODO remove this
		fabric = type(self.async_redis.connection.readline)
		self.async_redis.connection.old_read = self.async_redis.connection.readline

		def new_read(new_self, callback=None):
			try:
				return new_self.old_read(callback=callback)
			except Exception as e:
				current_online = self.get_online_from_redis(RedisPrefix.DEFAULT_CHANNEL)
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
	def connected(self):
		raise NotImplemented

	@connected.setter
	def connected(self, value):
		raise NotImplemented

	@engine
	def listen(self, channels):
		yield Task(
			self.async_redis.subscribe, channels)
		self.async_redis.listen(self.pub_sub_message)

	@property
	def logger(self):
		return self._logger if self._logger else base_logger

	@engine
	def add_channel(self, channel):
		self.channels.append(channel)
		yield Task(
			self.async_redis.subscribe, (channel,))

	@staticmethod
	def evaluate(query_set):
		do_db(len, query_set)
		return query_set

	def get_online_from_redis(self, channel, check_self_online=False):
		"""
		:rtype : dict
		returns (dict, bool) if check_type is present
		"""
		online = self.sync_redis.smembers(channel)
		self.logger.debug('!! channel %s redis online: %s', channel, online)
		result = set()
		user_is_online = False
		# redis stores8 REDIS_USER_FORMAT, so parse them
		if online:
			for raw in online:  # py2 iteritems
				decoded = raw.decode('utf-8')
				# : char specified in cookies_middleware.py.create_id
				user_id = int(decoded.split(':')[0])
				if user_id == self.user_id and decoded != self.id:
					user_is_online = True
				result.add(user_id)
		result = list(result)
		return (result, user_is_online) if check_self_online else result

	def add_online_user(self, room_id, offline_messages=None):
		"""
		adds to redis
		online_users = { connection_hash1 = stored_redis_user1, connection_hash_2 = stored_redis_user2 }
		:return:
		"""
		self.async_redis_publisher.sadd(room_id, self.id)
		# since we add user to online first, latest trigger will always show correct online
		online, is_online = self.get_online_from_redis(room_id, True)
		if not is_online:  # if a new tab has been opened
			online.append(self.user_id)
			online_user_names_mes = self.room_online(
				online,
				Actions.LOGIN,
				room_id
			)
			self.logger.info('!! First tab, sending refresh online for all')
			self.publish(online_user_names_mes, room_id)
			if offline_messages:
				self.ws_write(self.load_offline_message(offline_messages, room_id))
		else:  # Send user names to self
			online_user_names_mes = self.room_online(
				online,
				Actions.REFRESH_USER,
				room_id
			)
			self.logger.info('!! Second tab, retrieving online for self')
			self.ws_write(online_user_names_mes)

	def publish(self, message, channel, parsable=False):
		jsoned_mess = json.dumps(message)
		self.logger.debug('<%s> %s', channel, jsoned_mess)
		if parsable:
			jsoned_mess = self.encode(jsoned_mess)
		self.async_redis_publisher.publish(channel, jsoned_mess)

	def encode(self, message):
		"""
		Marks message with prefix to specify that
		it should be decoded and proccesed before sending to client
		@param message: message to mark
		@return: marked message
		"""
		return self.parsable_prefix + message

	def remove_parsable_prefix(self, message):
		if message.startswith(self.parsable_prefix):
			return message[1:]

	def pub_sub_message(self, message):
		data = message.body
		if isinstance(data, str_type):  # subscribe event
			prefixless_str = self.remove_parsable_prefix(data)
			if prefixless_str:
				dict_message = json.loads(prefixless_str)
				res = self.post_process_message[dict_message[VarNames.EVENT]](dict_message)
				if not res:
					self.ws_write(prefixless_str)
			else:
				self.ws_write(data)

	def ws_write(self, message):
		raise NotImplementedError('WebSocketHandler implements')

	def process_send_message(self, message):
		"""
		:type message: dict
		"""
		raw_imgs = message.get(VarNames.IMG)
		channel = message[VarNames.CHANNEL]
		message_db = Message(
			sender_id=self.user_id,
			content=message[VarNames.CONTENT],
			symbol=get_max_key(raw_imgs)
		)
		message_db.room_id = channel
		do_db(message_db.save)
		db_images = save_images(raw_imgs, message_db.id)
		prepared_message = self.create_send_message(
			message_db,
			Actions.PRINT_MESSAGE,
			prepare_img(db_images, message_db.id)
		)
		self.publish(prepared_message, channel)

	def close_file_connection(self, in_message):
		connection_id = in_message[VarNames.CONNECTION_ID]
		self_channel_status = self.sync_redis.shget(connection_id, self.id)
		if not self_channel_status:
			raise Exception("Access Denied")
		if self_channel_status != WebRtcRedisStates.CLOSED:
			sender_id = self.sync_redis.shget(WEBRTC_CONNECTION, connection_id)
			if sender_id == self.id:
				self.close_file_sender(connection_id)
			else:
				self.close_file_receiver(connection_id, in_message, sender_id)
			self.async_redis_publisher.hset(connection_id, self.id, WebRtcRedisStates.CLOSED)

	def close_call_connection(self, in_message):
		connection_id = in_message[VarNames.CONNECTION_ID]
		conn_users = self.sync_redis.shgetall(connection_id)
		if conn_users[self.id] in [WebRtcRedisStates.READY, WebRtcRedisStates.RESPONDED]:
			self.async_redis_publisher.hset(connection_id, self.id, WebRtcRedisStates.CLOSED)
			del conn_users[self.id]
			message = self.get_close_call_connection_message(connection_id)
			for user in conn_users:
				if conn_users[user] != WebRtcRedisStates.CLOSED:
					self.publish(message, user)
		else:
			raise ValidationError("Invalid channel status.")

	def cancel_call_connection(self, in_message):
		self.send_call_answer(in_message, WebRtcRedisStates.CLOSED, Actions.CANCEL_CALL_CONNECTION)

	def close_file_receiver(self, connection_id, in_message, sender_id):
		sender_status = self.sync_redis.shget(connection_id, sender_id)
		if not sender_status:
			raise Exception("Access denied")
		if sender_status != WebRtcRedisStates.CLOSED:
			in_message[VarNames.WEBRTC_OPPONENT_ID] = self.id
			in_message[VarNames.HANDLER_NAME] = HandlerNames.PEER_CONNECTION
			self.publish(in_message, sender_id)

	def close_file_sender(self, connection_id):
		values = self.sync_redis.shgetall(connection_id)
		del values[self.id]
		message = self.get_close_file_sender_message(connection_id)
		for ws_id in values:
			if values[ws_id] == WebRtcRedisStates.CLOSED:
				continue
			self.publish(message, ws_id)

	def accept_file(self, in_message):
		connection_id = in_message[VarNames.CONNECTION_ID]
		sender_ws_id = self.sync_redis.shget(WEBRTC_CONNECTION, connection_id)
		sender_ws_status = self.sync_redis.shget(connection_id, sender_ws_id)
		self_ws_status = self.sync_redis.shget(connection_id, self.id)
		if sender_ws_status == WebRtcRedisStates.READY and self_ws_status == WebRtcRedisStates.RESPONDED:
			self.async_redis_publisher.hset(connection_id, self.id, WebRtcRedisStates.READY)
			self.publish(self.get_accept_file_message(connection_id), sender_ws_id)
		else:
			raise ValidationError("Invalid channel status")

	# todo
	# we can use channel_status = self.sync_redis.shgetall(connection_id)
	# and then self.async_redis_publisher.hset(connection_id, self.id, WebRtcRedisStates.READY)
	# if we shgetall and only then do async hset
	# we can catch an issue when 2 concurrent users accepted the call
	# but we didn't  send them ACCEPT_CALL as they both were in status 'offered'
	def accept_call(self, in_message):
		connection_id = in_message[VarNames.CONNECTION_ID]
		self_status = self.sync_redis.shget(connection_id, self.id)
		if self_status == WebRtcRedisStates.RESPONDED:
			self.sync_redis.hset(connection_id, self.id, WebRtcRedisStates.READY)
			channel_status = self.sync_redis.shgetall(connection_id)
			del channel_status[self.id]
			message = self.get_accept_call_message(connection_id)
			for key in channel_status:
				if channel_status[key] != WebRtcRedisStates.CLOSED:
					self.publish(message, key)
		else:
			raise ValidationError("Invalid channel status")

	def offer_webrtc_connection(self, in_message):
		room_id = in_message[VarNames.CHANNEL]
		content = in_message.get(VarNames.CONTENT)
		qued_id = in_message[VarNames.WEBRTC_QUED_ID]
		connection_id = id_generator(RedisPrefix.CONNECTION_ID_LENGTH)
		# use list because sets dont have 1st element which is offerer
		self.async_redis_publisher.hset(WEBRTC_CONNECTION, connection_id, self.id)
		self.async_redis_publisher.hset(connection_id, self.id, WebRtcRedisStates.READY)
		opponents_message = self.offer_webrtc(content, connection_id, room_id, in_message[VarNames.EVENT])
		self_message = self.set_connection_id(qued_id, connection_id)
		self.ws_write(self_message)
		self.logger.info('!! Offering a webrtc, connection_id %s', connection_id)
		self.publish(opponents_message, room_id, True)

	def reply_call_connection(self, in_message):
		self.send_call_answer(in_message, WebRtcRedisStates.RESPONDED, Actions.REPLY_CALL_CONNECTION)

	def send_call_answer(self, in_message, status_set, reply_action):
		connection_id = in_message[VarNames.CONNECTION_ID]
		conn_users = self.sync_redis.shgetall(connection_id)
		if conn_users[self.id] == WebRtcRedisStates.OFFERED:
			self.async_redis_publisher.hset(connection_id, self.id, status_set)
			del conn_users[self.id]
			message = self.reply_webrtc(reply_action, connection_id)
			for user in conn_users:
				if conn_users[user] != WebRtcRedisStates.CLOSED:
					self.publish(message, user)
		else:
			raise ValidationError("Invalid channel status.")

	def reply_file_connection(self, in_message):
		connection_id = in_message[VarNames.CONNECTION_ID]
		sender_ws_id = self.sync_redis.shget(WEBRTC_CONNECTION, connection_id)
		sender_ws_status = self.sync_redis.shget(connection_id, sender_ws_id)
		self_ws_status = self.sync_redis.shget(connection_id, self.id)
		if sender_ws_status == WebRtcRedisStates.READY and self_ws_status == WebRtcRedisStates.OFFERED:
			self.async_redis_publisher.hset(connection_id, self.id, WebRtcRedisStates.RESPONDED)
			self.publish(self.reply_webrtc(Actions.REPLY_FILE_CONNECTION, connection_id), sender_ws_id)
		else:
			raise ValidationError("Invalid channel status.")

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
		in_message[VarNames.WEBRTC_OPPONENT_ID] = self.id
		in_message[VarNames.HANDLER_NAME] = HandlerNames.PEER_CONNECTION
		self.logger.debug(
			"Forwarding message to channel %s, self %s, other status %s",
			channel,
			self_channel_status,
			opponent_channel_status
		)
		self.publish(in_message, channel)

	def create_new_room(self, message):
		room_name = message[VarNames.ROOM_NAME]
		if not room_name or len(room_name) > 16:
			raise ValidationError('Incorrect room name "{}"'.format(room_name))
		room = Room(name=room_name)
		do_db(room.save)
		RoomUsers(room_id=room.id, user_id=self.user_id).save()
		subscribe_message = self.subscribe_room_channel_message(room.id, room_name)
		self.publish(subscribe_message, self.channel, True)

	def invite_user(self, message):
		room_id = message[VarNames.ROOM_ID]
		user_id = message[VarNames.USER_ID]
		if room_id not in self.channels:
			raise ValidationError("Access denied, only allowed for channels {}".format(self.channels))
		room = do_db(Room.objects.get, id=room_id)
		if room.is_private:
			raise ValidationError("You can't add users to direct room, create a new room instead")
		try:
			Room.users.through.objects.create(room_id=room_id, user_id=user_id)
		except IntegrityError:
			raise ValidationError("User is already in channel")
		users_in_room = {}
		for user in room.users.all():
			RedisPrefix.set_js_user_structure(users_in_room, user.id, user.username, user.sex)
		self.publish(self.add_user_to_room(room_id, user_id, users_in_room[user_id]), room_id)
		subscribe_message = self.invite_room_channel_message(room_id, user_id, room.name, users_in_room)
		self.publish(subscribe_message, RedisPrefix.generate_user(user_id), True)

	def create_room(self, user_rooms, user_id):
		if self.user_id == user_id:
			room_ids = list([room['room_id'] for room in self.evaluate(user_rooms)])
			query_res = execute_query(SELECT_SELF_ROOM, [room_ids, ])
		else:
			rooms_query = RoomUsers.objects.filter(user_id=user_id, room__in=user_rooms)
			query_res = rooms_query.values('room__id', 'room__disabled')
		try:
			room = do_db(query_res.get)
			room_id = room['room__id']
			update_room(room_id, room['room__disabled'])
		except RoomUsers.DoesNotExist:
			room = Room()
			room.save()
			room_id = room.id
			if self.user_id == user_id:
				RoomUsers(user_id=self.user_id, room_id=room_id).save()
			else:
				RoomUsers.objects.bulk_create([
					RoomUsers(user_id=user_id, room_id=room_id),
					RoomUsers(user_id=self.user_id, room_id=room_id),
				])
		return room_id

	def create_user_channel(self, message):
		user_id = message[VarNames.USER_ID]
		# get all self private rooms ids
		user_rooms = Room.users.through.objects.filter(user_id=self.user_id, room__name__isnull=True).values('room_id')
		# get private room that contains another user from rooms above
		room_id = self.create_room(user_rooms, user_id)
		subscribe_message = self.subscribe_direct_channel_message(room_id, user_id)
		self.publish(subscribe_message, self.channel, True)
		other_channel = RedisPrefix.generate_user(user_id)
		if self.channel != other_channel:
			self.publish(subscribe_message, other_channel, True)

	def delete_channel(self, message):
		room_id = message[VarNames.ROOM_ID]
		if room_id not in self.channels or room_id == ALL_ROOM_ID:
			raise ValidationError('You are not allowed to exit this room')
		room = do_db(Room.objects.get, id=room_id)
		if room.disabled:
			raise ValidationError('Room is already deleted')
		if room.name is None:  # if private then disable
			room.disabled = True
		else:  # if public -> leave the room, delete the link
			RoomUsers.objects.filter(room_id=room.id, user_id=self.user_id).delete()
			online = self.get_online_from_redis(room_id)
			online.remove(self.user_id)
			self.publish(self.room_online(online, Actions.LOGOUT, room_id), room_id)
		room.save()
		message = self.unsubscribe_direct_message(room_id)
		self.publish(message, room_id, True)

	def edit_message(self, data):
		# ord(next (iter (message['images'])))
		message_id = data[VarNames.MESSAGE_ID]
		message = Message.objects.get(id=message_id)
		if message.sender_id != self.user_id:
			raise ValidationError("You can only edit your messages")
		if message.time + 600000 < get_milliseconds():
			raise ValidationError("You can only edit messages that were send not more than 10 min ago")
		if message.deleted:
			raise ValidationError("Already deleted")
		message.content = data[VarNames.CONTENT]
		selector = Message.objects.filter(id=message_id)
		if message.content is None:
			action = Actions.DELETE_MESSAGE
			prep_imgs = None
			selector.update(deleted=True)
		else:
			action = Actions.EDIT_MESSAGE
			prep_imgs = process_images(data.get(VarNames.IMG), message)
			selector.update(content=message.content, symbol=message.symbol)
		self.publish(self.create_send_message(message, action, prep_imgs), message.room_id)

	def send_client_new_channel(self, message):
		room_id = message[VarNames.ROOM_ID]
		self.add_channel(room_id)
		self.add_online_user(room_id)

	def set_opponent_call_channel(self, message):
		connection_id = message[VarNames.CONNECTION_ID]
		if message[VarNames.WEBRTC_OPPONENT_ID] == self.id:
			return True
		self.sync_redis.hset(connection_id, self.id, WebRtcRedisStates.OFFERED)

	def send_client_delete_channel(self, message):
		room_id = message[VarNames.ROOM_ID]
		self.async_redis.unsubscribe((room_id,))
		self.async_redis_publisher.hdel(room_id, self.id)
		self.channels.remove(room_id)

	def process_get_messages(self, data):
		"""
		:type data: dict
		"""
		header_id = data.get(VarNames.GET_MESSAGES_HEADER_ID, None)
		count = int(data.get(VarNames.GET_MESSAGES_COUNT, 10))
		room_id = data[VarNames.CHANNEL]
		self.logger.info('!! Fetching %d messages starting from %s', count, header_id)
		if header_id is None:
			messages = Message.objects.filter(Q(room_id=room_id), Q(deleted=False)).order_by('-pk')[:count]
		else:
			messages = Message.objects.filter(Q(id__lt=header_id), Q(room_id=room_id), Q(deleted=False)).order_by('-pk')[:count]
		images = do_db(get_message_images, messages)
		response = self.get_messages(messages, room_id, images)
		self.ws_write(response)
