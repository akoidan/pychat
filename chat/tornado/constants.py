from django.conf import settings

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
	GROWL_MESSAGE = 'growl'
	GET_MESSAGES = 'loadMessages'
	CREATE_DIRECT_CHANNEL = 'addDirectChannel'
	DELETE_ROOM = 'deleteRoom'
	DELETE_MY_ROOM = DELETE_ROOM
	USER_LEAVES_ROOM = 'leaveUser'
	EDIT_MESSAGE = 'editMessage'
	DELETE_MESSAGE = 'deleteMessage'
	CREATE_ROOM_CHANNEL = 'addRoom'
	INVITE_USER = 'inviteUser'
	SET_WEBRTC_ID = 'setConnectionId'
	SET_WEBRTC_ERROR = 'setError'
	OFFER_FILE_CONNECTION = 'offerFile'
	OFFER_CALL_CONNECTION = 'offerCall'
	REPLY_FILE_CONNECTION = 'replyFile'
	RETRY_FILE_CONNECTION = 'retryFile'
	REPLY_CALL_CONNECTION = 'replyCall'
	PING = 'ping'
	PONG = 'pong'
	CHECK_PING = 'check_ping'


class VarNames(object):
	WEBRTC_QUED_ID = 'id'
	USER = 'user'
	USER_ID = 'userId'
	INVITER_USER_ID = 'inviterUserId'
	INVITEE_USER_ID = 'inviteeUserId'
	TIME = 'time'
	CONTENT = 'content'
	FILES = 'files'
	FILE_URL = 'url'
	FILE_TYPE = 'type'
	EVENT = 'action'
	JS_MESSAGE_ID = 'messageId'
	MESSAGE_ID = 'id'
	IMAGE_ID = 'id'
	GENDER = 'sex'
	ROOM_NAME = 'name'
	NOTIFICATIONS = 'notifications'
	VOLUME = 'volume'
	CURRENT_USER_INFO = 'userInfo'
	ROOM_ID = 'roomId'
	ROOMS = 'rooms'
	ROOM_USERS = 'users'
	WEBRTC_OPPONENT_ID = 'opponentWsId'
	CB_BY_SENDER = 'cbBySender'
	GET_MESSAGES_COUNT = 'count'
	GET_MESSAGES_HEADER_ID = 'headerId'
	IS_ROOM_PRIVATE = 'private'
	CONNECTION_ID = 'connId'
	HANDLER_NAME = 'handler'
	GIPHY = 'giphy'
	SYMBOL = 'symbol'
	LOAD_MESSAGES_HISTORY = 'history'
	LOAD_MESSAGES_OFFLINE = 'offline'
	ONLINE = 'online'
	EDITED_TIMES = 'edited'
	PREVIEW = 'preview'
	DELETED = 'deleted'


class HandlerNames:
	CHANNELS = 'channels'
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
	PARSABLE_PREFIX = 'p'
	ONLINE_VAR = 'online'
	CONNECTION_ID_LENGTH = 8  # should be secure

	@staticmethod
	def set_js_user_structure(name, sex):
		return {
			VarNames.USER: name,
			VarNames.GENDER: settings.GENDERS[sex]
		}

	@classmethod
	def generate_user(cls, key):
		return cls.USER_ID_CHANNEL_PREFIX + str(key)