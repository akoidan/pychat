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
	def base_default(event, content, handler):
		return {
			VarNames.EVENT: event,
			VarNames.CONTENT: content,
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

	def set_room(self, rooms, users, online, up):
		return {
			VarNames.ROOM_USERS: users,
			VarNames.ONLINE: online,
			VarNames.ROOMS: rooms,
			VarNames.HANDLER_NAME: HandlerNames.WS,
			VarNames.EVENT: Actions.SET_WS_ID,
			VarNames.WEBRTC_OPPONENT_ID: self.id,
			VarNames.CURRENT_USER_INFO: {
				VarNames.USER: self.sender_name,
				VarNames.USER_ID: self.user_id,
				'suggestions': up.suggestions,
				'sendLogs': up.send_logs,
				'embeddedYoutube': up.embedded_youtube,
				'incomingFileCallSound': up.incoming_file_call_sound,
				'messageSound': up.message_sound,
				'theme': up.theme,
				'highlightCode': up.highlight_code,
				'onlineChangeSound': up.online_change_sound,
			}
		}

	def room_online(self, online, event):
		"""
		:return: {"action": event, "content": content, "time": "20:48:57"}
		"""
		room_less = self.default(online, event, HandlerNames.CHANNELS)
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
			VarNames.EDITED_TIMES: message.edited_times,
			VarNames.ROOM_ID: message.room_id,
		}
		if message.deleted:
			res[VarNames.DELETED] = True
		if files:
			res[VarNames.FILES] = files
		if message.symbol:
			res[VarNames.SYMBOL] = message.symbol
		if message.giphy:
			res[VarNames.GIPHY] = message.giphy
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
		res[VarNames.HANDLER_NAME] = HandlerNames.CHANNELS
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
	def get_messages(cls, messages, channel, files, prepare_img, message_id):
		"""
		:type images: list[chat.models.Image]
		:type messages: list[chat.models.Message]
		:type channel: str
		"""
		return {
			VarNames.CONTENT: cls.append_images(messages, files, prepare_img),
			VarNames.EVENT: Actions.GET_MESSAGES,
			VarNames.ROOM_ID: channel,
			VarNames.JS_MESSAGE_ID: message_id,
			VarNames.HANDLER_NAME: HandlerNames.CHANNELS
		}

	@staticmethod
	def ping_client(time):
		return {
			VarNames.EVENT: Actions.PING,
			VarNames.TIME: time,
			VarNames.HANDLER_NAME: HandlerNames.WS,
		}

	@staticmethod
	def prepare_img_video(files, message_id):
		"""
		:type message_id: int
		:type files: list[chat.models.Image]
		"""
		if files:
			return {x.symbol: {
				VarNames.FILE_URL: x.img.url,
				VarNames.FILE_TYPE: x.type,
				VarNames.PREVIEW: x.preview.url if x.preview else None,
				VarNames.IMAGE_ID: x.id
			} for x in files if x.message_id == message_id}

	@property
	def channel(self):
		return RedisPrefix.generate_user(self.user_id)

	def subscribe_direct_channel_message(self, room_id, users_id, notifications):
		return {
			VarNames.EVENT: Actions.CREATE_DIRECT_CHANNEL,
			VarNames.VOLUME: 2,
			VarNames.NOTIFICATIONS: notifications,
			VarNames.ROOM_ID: room_id,
			VarNames.TIME: get_milliseconds(),
			VarNames.ROOM_USERS: users_id,
			VarNames.HANDLER_NAME: HandlerNames.CHANNELS
		}

	def responde_pong(self, js_id):
		return {
			VarNames.EVENT: Actions.PONG,
			VarNames.HANDLER_NAME: HandlerNames.WS,
			VarNames.JS_MESSAGE_ID: js_id
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
	def add_user_to_room(channel, channel_name, inviter, invitee, all_users):
		return {
			VarNames.EVENT: Actions.INVITE_USER,
			VarNames.ROOM_ID: channel,
			VarNames.ROOM_NAME: channel_name,
			VarNames.INVITEE_USER_ID: invitee,
			VarNames.INVITER_USER_ID: inviter,
			VarNames.HANDLER_NAME: HandlerNames.CHANNELS,
			VarNames.ROOM_USERS: all_users,
			VarNames.TIME: get_milliseconds(),
		}

	def unsubscribe_direct_message(self, room_id, room_user_ids, room_name):
		return {
			VarNames.EVENT: Actions.DELETE_ROOM,
			VarNames.ROOM_ID: room_id,
			VarNames.USER_ID: self.user_id,
			VarNames.HANDLER_NAME: HandlerNames.CHANNELS,
			VarNames.ROOM_USERS: room_user_ids,
			VarNames.ROOM_NAME: room_name,
			VarNames.TIME: get_milliseconds()
		}

	@staticmethod
	def create_user_rooms(user_rooms):
		res = {room['id']: {
			VarNames.ROOM_NAME: room['name'],
			VarNames.NOTIFICATIONS: room['roomusers__notifications'],
			VarNames.VOLUME: room['roomusers__volume'],
			VarNames.ROOM_USERS: []
		} for room in user_rooms}
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
			VarNames.ROOM_ID: room_id
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
