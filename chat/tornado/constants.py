from chat.settings import ALL_ROOM_ID, GENDERS


class Actions(object):
	LOGIN = 'addOnlineUser'
	SET_WS_ID = 'setWsId'
	LOGOUT = 'removeOnlineUser'
	SEND_MESSAGE = 'sendMessage'
	PRINT_MESSAGE = 'printMessage'
	WEBRTC = 'sendRtcData'
	CLOSE_FILE_CONNECTION = 'destroyFileConnection'
	CLOSE_CALL_CONNECTION = 'destroyCallConnection'
	CANCEL_CALL_CONNECTION = 'cancelCallConnection'
	ACCEPT_CALL = 'acceptCall'
	ACCEPT_FILE = 'acceptFile'
	ROOMS = 'setRooms'
	REFRESH_USER = 'setOnlineUsers'
	GROWL_MESSAGE = 'growl'
	GET_MESSAGES = 'loadMessages'
	CREATE_DIRECT_CHANNEL = 'addDirectChannel'
	DELETE_ROOM = 'deleteRoom'
	EDIT_MESSAGE = 'editMessage'
	DELETE_MESSAGE = 'deleteMessage'
	CREATE_ROOM_CHANNEL = 'addRoom'
	INVITE_USER = 'inviteUser'
	ADD_USER = 'addUserToDom'
	OFFLINE_MESSAGES = 'loadOfflineMessages'
	SET_WEBRTC_ID = 'setConnectionId'
	SET_WEBRTC_ERROR = 'setError'
	OFFER_FILE_CONNECTION = 'offerFile'
	OFFER_CALL_CONNECTION = 'offerCall'
	REPLY_FILE_CONNECTION = 'replyFile'
	RETRY_FILE_CONNECTION = 'retryFile'
	REPLY_CALL_CONNECTION = 'replyCall'
	PING = 'ping'


class VarNames(object):
	WEBRTC_QUED_ID = 'id'
	USER = 'user'
	USER_ID = 'userId'
	TIME = 'time'
	CONTENT = 'content'
	IMG = 'images'
	IMG_B64 = 'b64'
	IMG_FILE_NAME = 'fileName'
	EVENT = 'action'
	MESSAGE_ID = 'id'
	GENDER = 'sex'
	ROOM_NAME = 'name'
	ROOM_ID = 'roomId'
	ROOM_USERS = 'users'
	CHANNEL = 'channel'
	WEBRTC_OPPONENT_ID = 'opponentWsId'
	GET_MESSAGES_COUNT = 'count'
	GET_MESSAGES_HEADER_ID = 'headerId'
	CHANNEL_NAME = 'channel'
	IS_ROOM_PRIVATE = 'private'
	CONNECTION_ID = 'connId'
	HANDLER_NAME = 'handler'
	SYMBOL = 'symbol'


class HandlerNames:
	CHANNELS = 'channels'
	CHAT = 'chat'
	GROWL = 'growl'
	WEBRTC = 'webrtc'
	PEER_CONNECTION = 'peerConnection'
	WEBRTC_TRANSFER = 'webrtcTransfer'
	WS = 'ws'


class WebRtcRedisStates:
	RESPONDED = 'responded'
	READY = 'ready'
	OFFERED = 'offered'
	CLOSED = 'closed'


class RedisPrefix:
	USER_ID_CHANNEL_PREFIX = 'u'
	DEFAULT_CHANNEL = ALL_ROOM_ID
	CONNECTION_ID_LENGTH = 8  # should be secure

	@staticmethod
	def set_js_user_structure(name, sex):
		return {
			VarNames.USER: name,
			VarNames.GENDER: GENDERS[sex]
		}

	@classmethod
	def generate_user(cls, key):
		return cls.USER_ID_CHANNEL_PREFIX + str(key)