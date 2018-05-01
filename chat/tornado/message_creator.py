from chat.models import get_milliseconds
from chat.tornado.constants import VarNames, HandlerNames, Actions, RedisPrefix


class MessagesCreator(object):

	def default(self, content, event, handler):
		"""
		:return: {"action": event, "content": content, "time": "20:48:57"}
		"""
		return {
			VarNames.EVENT: event,
			VarNames.CONTENT: content,
			VarNames.USER_ID: self.user_id,
			VarNames.TIME: get_milliseconds(),
			VarNames.HANDLER_NAME: handler
		}

	@staticmethod
	def set_ws_id(random, self_id):
		return {
			VarNames.HANDLER_NAME: HandlerNames.WS,
			VarNames.EVENT: Actions.SET_WS_ID,
			VarNames.CONTENT: random,
			VarNames.WEBRTC_OPPONENT_ID: self_id
		}

	def room_online(self, online, event, channel):
		"""
		:return: {"action": event, "content": content, "time": "20:48:57"}
		"""
		room_less = self.default(online, event, HandlerNames.CHAT)
		room_less[VarNames.CHANNEL_NAME] = channel
		room_less[VarNames.USER] = self.sender_name
		room_less[VarNames.GENDER] = self.sex
		return room_less

	@classmethod
	def create_message(cls, message, files):
		res = {
			VarNames.USER_ID: message.sender_id,
			VarNames.CONTENT: message.content,
			VarNames.TIME: message.time,
			VarNames.MESSAGE_ID: message.id,
			VarNames.FILES: files,
			VarNames.GIPHY: message.giphy,
			VarNames.EDITED_TIMES: message.edited_times
		}
		return res

	@classmethod
	def create_send_message(cls, message, event, files, js_id):
		"""
		:type message: chat.models.Message
		:type imgs: dict
		:type event: Actions
		:return: "action": "joined", "content": {"v5bQwtWp": "alien", "tRD6emzs": "Alien"},
		"sex": "Alien", "user": "tRD6emzs", "time": "20:48:57"}
		"""
		res = cls.create_message(message, files)
		res[VarNames.EVENT] = event
		res[VarNames.JS_MESSAGE_ID] = js_id
		res[VarNames.CHANNEL] = message.room_id
		res[VarNames.SYMBOL] = message.symbol
		res[VarNames.HANDLER_NAME] = HandlerNames.CHAT
		return res

	@classmethod
	def append_images(cls, messages, files, prepare_img):
		"""
		:type messages: list[chat.models.Message] 
		:type files: list[chat.models.Image]
		"""
		res_mess = []
		for message in messages:
			res_mess.append(cls.create_message(message, prepare_img(files, message.id)))
		return res_mess

	@classmethod
	def get_messages(cls, messages, channel, files, prepare_img):
		"""
		:type images: list[chat.models.Image]
		:type messages: list[chat.models.Message]
		:type channel: str
		"""
		return {
			VarNames.CONTENT: cls.append_images(messages, files, prepare_img),
			VarNames.EVENT: Actions.GET_MESSAGES,
			VarNames.CHANNEL: channel,
			VarNames.HANDLER_NAME: HandlerNames.CHAT
		}

	@staticmethod
	def prepare_img_video(files, message_id):
		"""
		:type message_id: int
		:type files: list[chat.models.Image]
		"""
		if files:
			return {x.symbol: {VarNames.FILE_URL: x.img.url, VarNames.FILE_TYPE: x.type} for x in files if x.message_id == message_id}

	@property
	def channel(self):
		return RedisPrefix.generate_user(self.user_id)

	def subscribe_direct_channel_message(self, room_id, other_user_id, notifications):
		return {
			VarNames.EVENT: Actions.CREATE_DIRECT_CHANNEL,
			VarNames.VOLUME: 2,
			VarNames.NOTIFICATIONS: notifications,
			VarNames.ROOM_ID: room_id,
			VarNames.ROOM_USERS: [self.user_id, other_user_id],
			VarNames.HANDLER_NAME: HandlerNames.CHANNELS
		}

	def responde_pong(self):
		return {
			VarNames.EVENT: Actions.PING,
			VarNames.HANDLER_NAME: HandlerNames.WS
		}

	def subscribe_room_channel_message(self, room_id, room_name):
		return {
			VarNames.EVENT: Actions.CREATE_ROOM_CHANNEL,
			VarNames.ROOM_ID: room_id,
			VarNames.ROOM_USERS: [self.user_id],
			VarNames.HANDLER_NAME: HandlerNames.CHANNELS,
			VarNames.VOLUME: 2,
			VarNames.NOTIFICATIONS: True,
			VarNames.ROOM_NAME: room_name
		}

	@staticmethod
	def invite_room_channel_message(room_id, user_id, room_name, users):
		return {
			VarNames.EVENT: Actions.INVITE_USER,
			VarNames.ROOM_ID: room_id,
			VarNames.USER_ID: user_id,
			VarNames.HANDLER_NAME: HandlerNames.CHANNELS,
			VarNames.ROOM_NAME: room_name,
			VarNames.CONTENT: users
		}

	@staticmethod
	def add_user_to_room(channel, user_id, content):
		return {
			VarNames.EVENT: Actions.ADD_USER,
			VarNames.CHANNEL: channel,
			VarNames.USER_ID: user_id,
			VarNames.HANDLER_NAME: HandlerNames.CHAT,
			VarNames.GENDER: content[VarNames.GENDER],  # SEX: 'Alien', USER: 'Andrew'
			VarNames.USER: content[VarNames.USER]  # SEX: 'Alien', USER: 'Andrew'
		}

	def unsubscribe_direct_message(self, room_id):
		return {
			VarNames.EVENT: Actions.DELETE_ROOM,
			VarNames.ROOM_ID: room_id,
			VarNames.USER_ID: self.user_id,
			VarNames.HANDLER_NAME: HandlerNames.CHANNELS,
			VarNames.TIME: get_milliseconds()
		}

	def load_offline_message(self, offline_messages, history_messages, channel_key):
		res = self.default({
			VarNames.LOAD_MESSAGES_OFFLINE: offline_messages,
			VarNames.LOAD_MESSAGES_HISTORY: history_messages
		},
			Actions.OFFLINE_MESSAGES,
			HandlerNames.CHAT)
		res[VarNames.CHANNEL] = channel_key
		return res


class WebRtcMessageCreator(object):

	def offer_webrtc(self, content, connection_id, room_id, action):
		"""
		:return: {"action": "call", "content": content, "time": "20:48:57"}
		"""
		return {
			VarNames.EVENT: action,
			VarNames.CONTENT: content,
			VarNames.USER_ID: self.user_id,
			VarNames.HANDLER_NAME: HandlerNames.WEBRTC,
			VarNames.USER: self.sender_name,
			VarNames.CONNECTION_ID: connection_id,
			VarNames.WEBRTC_OPPONENT_ID: self.id,
			VarNames.CHANNEL: room_id
		}

	def set_webrtc_error(self, error, connection_id, qued_id=None):
		return {
			VarNames.EVENT: Actions.SET_WEBRTC_ERROR,
			VarNames.CONTENT: error,
			VarNames.USER_ID: self.user_id,
			VarNames.HANDLER_NAME: HandlerNames.PEER_CONNECTION,
			VarNames.CONNECTION_ID: connection_id,
			VarNames.WEBRTC_QUED_ID: qued_id
		}

	@staticmethod
	def set_connection_id(qued_id, connection_id):
		return {
			VarNames.EVENT: Actions.SET_WEBRTC_ID,
			VarNames.HANDLER_NAME: HandlerNames.WEBRTC,
			VarNames.CONNECTION_ID: connection_id,
			VarNames.WEBRTC_QUED_ID: qued_id
		}

	def get_close_file_sender_message(self, connection_id):
		return {
			VarNames.EVENT: Actions.CLOSE_FILE_CONNECTION,
			VarNames.CONNECTION_ID: connection_id,
			VarNames.WEBRTC_OPPONENT_ID: self.id,
			VarNames.HANDLER_NAME: HandlerNames.WEBRTC_TRANSFER,
		}

	def get_accept_file_message(self, connection_id, content):
		return {
			VarNames.EVENT: Actions.ACCEPT_FILE,
			VarNames.CONNECTION_ID: connection_id,
			VarNames.WEBRTC_OPPONENT_ID: self.id,
			VarNames.HANDLER_NAME: HandlerNames.PEER_CONNECTION,
			VarNames.CONTENT: content,
		}

	def reply_webrtc(self, event, connection_id, handler, content):
		return {
			VarNames.EVENT: event,
			VarNames.CONNECTION_ID: connection_id,
			VarNames.USER_ID: self.user_id,
			VarNames.USER: self.sender_name,
			VarNames.CONTENT: content,
			VarNames.WEBRTC_OPPONENT_ID: self.id,
			VarNames.HANDLER_NAME: handler,
		}

	def retry_file(self, connection_id):
		return {
			VarNames.EVENT: Actions.RETRY_FILE_CONNECTION,
			VarNames.CONNECTION_ID: connection_id,
			VarNames.WEBRTC_OPPONENT_ID: self.id,
			VarNames.HANDLER_NAME: HandlerNames.PEER_CONNECTION,
		}
