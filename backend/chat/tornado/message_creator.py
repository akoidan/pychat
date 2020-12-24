from chat.models import get_milliseconds
from chat.tornado.constants import VarNames, HandlerNames, Actions, RedisPrefix, UserSettingsVarNames, \
	UserProfileVarNames


class MessagesCreator(object):

	def __init__(self, user_id, id):
		self.user_id = user_id
		self.id = id

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

	def set_room(self, rooms, users, online, up, channels):
		return {
			VarNames.ROOM_USERS: users,
			VarNames.ONLINE: online,
			VarNames.ROOMS: rooms,
			VarNames.CHANNELS: channels,
			VarNames.HANDLER_NAME: HandlerNames.WS,
			VarNames.EVENT: Actions.SET_WS_ID,
			VarNames.WEBRTC_OPPONENT_ID: self.id,
			VarNames.TIME: get_milliseconds(),
			VarNames.USER_IMAGE: up.photo.url if up.photo else None,
			VarNames.CURRENT_USER_SETTINGS: self.get_user_settings(up),
			VarNames.CURRENT_USER_INFO: self.get_user_profile(up),
		}

	def set_settings(self, js_message_id,  message):
		return  {
			VarNames.HANDLER_NAME: HandlerNames.WS,
			VarNames.EVENT: Actions.SET_SETTINGS,
			VarNames.CB_BY_SENDER: self.id,
			VarNames.JS_MESSAGE_ID: js_message_id,
			VarNames.CONTENT: message,
		}

	@staticmethod
	def set_profile_image(url):
		return {
			VarNames.HANDLER_NAME: HandlerNames.WS,
			VarNames.EVENT: Actions.SET_PROFILE_IMAGE,
			VarNames.CONTENT: url,
		}

	def changed_user_profile(self, sex,  user_id, username):
		return  {
			VarNames.HANDLER_NAME: HandlerNames.WS,
			VarNames.EVENT: Actions.USER_PROFILE_CHANGED,
			UserProfileVarNames.SEX: sex,
			UserProfileVarNames.USER_ID: user_id,
			UserProfileVarNames.USERNAME: username,
		}

	def set_user_profile(self, js_message_id,  message):
		return  {
			VarNames.HANDLER_NAME: HandlerNames.WS,
			VarNames.EVENT: Actions.SET_USER_PROFILE,
			VarNames.CB_BY_SENDER: self.id,
			VarNames.JS_MESSAGE_ID: js_message_id,
			VarNames.CONTENT: message,
		}


	@staticmethod
	def get_user_settings(up):
		return {
			UserSettingsVarNames.SUGGESTIONS: up.suggestions,
			UserSettingsVarNames.SEND_LOGS: up.send_logs,
			UserSettingsVarNames.LOGS: up.logs,
			UserSettingsVarNames.EMBEDDED_YOUTUBE: up.embedded_youtube,
			UserSettingsVarNames.INCOMING_FILE_CALL_SOUND: up.incoming_file_call_sound,
			UserSettingsVarNames.MESSAGE_SOUND: up.message_sound,
			UserSettingsVarNames.THEME: up.theme,
			UserSettingsVarNames.HIGHLIGHT_CODE: up.highlight_code,
			UserSettingsVarNames.ONLINE_CHANGE_SOUND: up.online_change_sound
		}

	@staticmethod
	def get_user_profile(up):
		return {
			UserProfileVarNames.USERNAME: up.username,
			UserProfileVarNames.USER_ID: up.id,
			UserProfileVarNames.NAME: up.name,
			UserProfileVarNames.CITY: up.city,
			UserProfileVarNames.SEX: up.sex_str,
			UserProfileVarNames.CONTACTS: up.contacts,
			UserProfileVarNames.BIRTHDAY: str(up.birthday) if up.birthday else None,
			UserProfileVarNames.EMAIL: up.email,
			UserProfileVarNames.SURNAME: up.surname,
		}

	def room_online_logout(self, online):
		"""
		:return: {"action": event, "content": content, "time": "20:48:57"}
		"""
		room_less = self.default(online, Actions.LOGOUT, HandlerNames.ROOM)
		return room_less

	def room_online_login(self, online, sender_name, sex):
		"""
		:return: {"action": event, "content": content, "time": "20:48:57"}
		"""
		room_less = self.default(online, Actions.LOGIN, HandlerNames.ROOM)
		room_less[VarNames.USER] = sender_name
		room_less[VarNames.GENDER] = sex
		room_less[VarNames.WEBRTC_OPPONENT_ID] = self.id
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
			VarNames.PARENT_MESSAGE: message.parent_message_id,
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

	def create_send_message(self, message, event, files):
		"""
		:type message: chat.models.Message
		:type imgs: dict
		:type event: Actions
		:return: "action": "joined", "content": {"v5bQwtWp": "alien", "tRD6emzs": "Alien"},
		"sex": "Alien", "user": "tRD6emzs", "time": "20:48:57"}
		"""
		res = self.create_message(message, files)
		res[VarNames.EVENT] = event
		res[VarNames.CB_BY_SENDER] = self.id
		res[VarNames.HANDLER_NAME] = HandlerNames.WS_MESSAGE
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
			VarNames.ROOM_ID: channel,
			VarNames.JS_MESSAGE_ID: message_id,
			VarNames.HANDLER_NAME: HandlerNames.NULL
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

	def responde_pong(self, js_id):
		return {
			VarNames.EVENT: Actions.PONG,
			VarNames.HANDLER_NAME: HandlerNames.WS,
			VarNames.JS_MESSAGE_ID: js_id
		}

	@staticmethod
	def get_session(session_id):
		return {
			'session': session_id,
		}

	@staticmethod
	def get_oauth_session(session_id, username, is_new):
		return {
			'session': session_id,
			'username': username,
			'isNewAccount': is_new,
		}

	def unsubscribe_direct_message(self, room_id, js_id, myws_id, users, name):
		"""
		:param name: so we can determine on pubsub message if it's private
		"""
		return {
			VarNames.EVENT: Actions.DELETE_ROOM,
			VarNames.ROOM_ID: room_id,
			VarNames.ROOM_NAME: name,
			VarNames.JS_MESSAGE_ID: js_id,
			VarNames.USER_ID: self.user_id,
			VarNames.HANDLER_NAME: HandlerNames.ROOM,
			VarNames.CB_BY_SENDER: myws_id,
			VarNames.ROOM_USERS: users
		}


class WebRtcMessageCreator(MessagesCreator):

	def offer_webrtc(self, content, connection_id, room_id, action, thread_id=None):
		"""
		:return: {"action": "call", "content": content, "time": "20:48:57"}
		"""
		return {
			VarNames.EVENT: action,
			VarNames.CONTENT: content,
			VarNames.USER_ID: self.user_id,
			VarNames.HANDLER_NAME: HandlerNames.WEBRTC,
			VarNames.CONNECTION_ID: connection_id,
			VarNames.WEBRTC_OPPONENT_ID: self.id,
			VarNames.ROOM_ID: room_id,
			VarNames.THREAD_ID: thread_id,
			VarNames.TIME: get_milliseconds()
		}

	# def set_webrtc_error(self, error, connection_id, qued_id=None):
	# 	return {
	# 		VarNames.EVENT: Actions.SET_WEBRTC_ERROR,
	# 		VarNames.CONTENT: error,
	# 		VarNames.USER_ID: self.user_id,
	# 		VarNames.HANDLER_NAME: HandlerNames.PEER_CONNECTION.format(connection_id),
	# 		VarNames.WEBRTC_QUED_ID: qued_id
	# 	}

	@staticmethod
	def set_connection_id(js_message_id, connection_id):
		return {
			VarNames.EVENT: Actions.SET_WEBRTC_ID,
			VarNames.HANDLER_NAME: HandlerNames.NULL,
			VarNames.CONNECTION_ID: connection_id,
			VarNames.JS_MESSAGE_ID: js_message_id,
			VarNames.TIME: get_milliseconds(),
		}

	def get_close_file_sender_message(self, connection_id):
		return {
			VarNames.EVENT: Actions.CLOSE_FILE_CONNECTION,
			VarNames.HANDLER_NAME: HandlerNames.PEER_CONNECTION.format(connection_id, self.id),
		}

	def get_accept_file_message(self, connection_id, content):
		return {
			VarNames.EVENT: Actions.ACCEPT_FILE,
			VarNames.HANDLER_NAME: HandlerNames.PEER_CONNECTION.format(connection_id, self.id),
			VarNames.CONTENT: content,
		}

	def reply_webrtc(self, event, connection_id, handler, content):
		return {
			VarNames.EVENT: event,
			VarNames.CONNECTION_ID: connection_id,  # required
			VarNames.USER_ID: self.user_id,
			VarNames.CONTENT: content,
			VarNames.WEBRTC_OPPONENT_ID: self.id,  # required
			VarNames.HANDLER_NAME: handler.format(connection_id, self.id), #  TODO
		}

	def retry_file(self, connection_id):
		return {
			VarNames.EVENT: Actions.RETRY_FILE_CONNECTION,
			# VarNames.CONNECTION_ID: connection_id,
			# VarNames.WEBRTC_OPPONENT_ID: self.id,
			VarNames.HANDLER_NAME: HandlerNames.PEER_CONNECTION.format(connection_id, self.id),
		}
