from django.conf import settings


class Actions(object):
	LOGIN = 'addOnlineUser'
	SET_WS_ID = 'setWsId'
	LOGOUT = 'removeOnlineUser'
	PRINT_MESSAGE = 'printMessage'
	WEBRTC = 'sendRtcData'
	CLOSE_FILE_CONNECTION = 'destroyFileConnection'
	CLOSE_CALL_CONNECTION = 'destroyCallConnection'
	CANCEL_CALL_CONNECTION = 'cancelCallConnection'
	ACCEPT_CALL = 'acceptCall'
	JOIN_CALL = 'joinCall'
	ACCEPT_FILE = 'acceptFile'
	GROWL_ERROR_MESSAGE = 'growlError'
	GET_MESSAGES = 'loadMessages'
	GET_MESSAGES_BY_IDS = 'loadMessagesByIds'
	GET_COUNTRY_CODES = 'getCountryCode'
	DELETE_ROOM = 'deleteRoom'
	USER_LEAVES_ROOM = 'leaveUser'
	EDIT_MESSAGE = 'editMessage'
	DELETE_MESSAGE = 'deleteMessage'
	CREATE_ROOM = 'addRoom'
	CREATE_CHANNEL = 'addChannel'
	SET_SETTINGS = 'setSettings'
	USER_PROFILE_CHANGED = 'userProfileChanged'
	SET_USER_PROFILE = 'setUserProfile'
	SET_PROFILE_IMAGE = 'setProfileImage'
	INVITE_USER = 'inviteUser'
	ADD_INVITE = 'addInvite'
	SET_WEBRTC_ID = 'setConnectionId'
	SET_WEBRTC_ERROR = 'setError'
	OFFER_FILE_CONNECTION = 'offerFile'
	OFFER_CALL_CONNECTION = 'offerCall'
	OFFER_P2P_CONNECTION = 'offerMessage'
	REPLY_FILE_CONNECTION = 'replyFile'
	RETRY_FILE_CONNECTION = 'retryFile'
	REPLY_CALL_CONNECTION = 'replyCall'
	NOTIFY_CALL_ACTIVE = 'notifyCallActive'
	SYNC_HISTORY = 'syncHistory'
	SHOW_I_TYPE = 'showIType'
	SET_MESSAGE_STATUS = 'setMessageStatus'
	SEARCH_MESSAGES = 'searchMessages'
	PING = 'ping'
	PONG = 'pong'
	CHECK_PING = 'check_ping'
	SAVE_CHANNEL_SETTINGS = 'saveChannelSettings'
	SAVE_ROOM_SETTINGS = 'saveRoomSettings'
	DELETE_CHANNEL = 'deleteChannel'
	LEAVE_CHANNEL = 'leaveChannel'
	CREATE_NEW_USER = 'createNewUser'


class VarNames(object):
	WEBRTC_QUED_ID = 'id'
	USER = 'user'
	USER_ID = 'userId'
	INVITER_USER_ID = 'inviterUserId'
	INVITEE_USER_ID = 'inviteeUserId'
	TIME = 'time'
	THREAD_ID = 'threadId'
	CONTENT = 'content'
	SEARCH_OFFSET = 'offset'
	SEARCH_STRING = 'searchString'
	FILES = 'files'
	FILE_URL = 'url'
	FILE_TYPE = 'type'
	EVENT = 'action'
	JS_MESSAGE_ID = 'cbId'
	MESSAGE_TAGS = 'tags'
	MESSAGE_ID = 'id'
	IMAGE_ID = 'id'
	GENDER = 'sex'
	LOCATION = 'location'
	ROOM_NAME = 'name'
	CHANNEL_NAME = 'channelName'
	CHANNEL_ID = 'channelId'
	ROOM_CREATOR_ID = 'roomCreatorId'
	IS_MAIN_IN_CHANNEL = 'isMainInChannel'
	CHANNEL_CREATOR_ID = 'channelCreatorId'
	NOTIFICATIONS = 'notifications'
	VOLUME = 'volume'
	CURRENT_USER_INFO = 'userInfo'
	CURRENT_USER_SETTINGS = 'userSettings'
	ROOM_ID = 'roomId'
	ROOM_IDS = 'roomIds'
	PARENT_MESSAGE = 'parentMessage'
	THREAD_MESSAGES_COUNT = 'threadMessagesCount'
	ROOMS = 'rooms'
	CHANNELS = 'channels'
	ROOM_USERS = 'users'
	WEBRTC_OPPONENT_ID = 'opponentWsId'
	USER_IMAGE = 'userImage'
	CB_BY_SENDER = 'cbBySender'
	GET_MESSAGES_COUNT = 'count'
	EXCLUDE_IDS = 'excludeIds'
	IS_ROOM_PRIVATE = 'private'
	CONNECTION_ID = 'connId'
	HANDLER_NAME = 'handler'
	GIPHIES = 'giphies'
	SYMBOL = 'symbol'
	ONLINE = 'online'
	TIME_DIFF = 'timeDiff'
	EDITED_TIMES = 'edited'
	PREVIEW = 'preview'
	DELETED = 'deleted'
	P2P = 'p2p'
	LAST_SYNCED = 'lastSynced'
	MESSAGE_IDS = 'messagesIds'
	ON_SERVER_MESSAGE_IDS = 'onServerMessageIds'
	RECEIVED_MESSAGE_IDS = 'receivedMessageIds'
	READ_MESSAGE_IDS = 'readMessageIds'
	MESSAGE_STATUS = 'status'


class IpVarNames(object):
	COUNTRY = 'country'
	REGION = 'region'
	CITY = 'city'
	COUNTRY_CODE = 'countryCode'


class UserSettingsVarNames(object):
	SUGGESTIONS = 'suggestions'
	EMBEDDED_YOUTUBE = 'embeddedYoutube'
	HIGHLIGHT_CODE = 'highlightCode'
	MESSAGE_SOUND = 'messageSound'
	SHOW_WHEN_I_TYPING = 'showWhenITyping'
	INCOMING_FILE_CALL_SOUND = 'incomingFileCallSound'
	ONLINE_CHANGE_SOUND = 'onlineChangeSound'
	LOGS = 'logs'
	SEND_LOGS = 'sendLogs'
	THEME = 'theme'

class UserProfileVarNames(object):
	USERNAME = VarNames.USER
	USER_ID = VarNames.USER_ID
	NAME = 'name'
	CITY = 'city'
	SURNAME = 'surname'
	EMAIL = 'email'
	BIRTHDAY = 'birthday'
	CONTACTS = 'contacts'
	SEX = 'sex'

class HandlerNames:
	ROOM = 'room'
	WS_MESSAGE = 'ws-message'
	WEBRTC = 'webrtc'
	PEER_CONNECTION = 'peerConnection:{}:{}'
	WEBRTC_TRANSFER = 'webrtcTransfer:{}'
	WS = 'ws'
	NULL = 'void'


class WebRtcRedisStates:
	RESPONDED = 'responded'
	READY = 'ready'
	OFFERED = 'offered'
	CLOSED = 'closed'


class RedisPrefix:
	USER_ID_CHANNEL_PREFIX = 'u'
	PARSABLE_PREFIX = 'p'
	ONLINE_VAR = 'online'
	P2P_MESSAGE_VAR = 'p2p'
	WEBRTC_CONNECTION = 'webrtc_conn'
	CONNECTION_ID_LENGTH = 8  # should be secure

	@staticmethod
	def set_js_user_structure(id, name, sex, image):
		return {
			VarNames.USER: name,
			VarNames.USER_ID: id,
			VarNames.GENDER: settings.GENDERS[sex],
			VarNames.USER_IMAGE: image
		}

	@classmethod
	def generate_user(cls, key):
		return cls.USER_ID_CHANNEL_PREFIX + str(key)
