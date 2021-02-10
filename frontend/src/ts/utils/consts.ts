// webpack global consts
declare const PYCHAT_CONSTS: any;

const allConsts = PYCHAT_CONSTS;
export const {
  IS_DEBUG,
  IS_SSL,
  BACKEND_ADDRESS,
  GOOGLE_OAUTH_2_CLIENT_ID,
  FACEBOOK_APP_ID,
  PUBLIC_PATH,
  RECAPTCHA_PUBLIC_KEY,
  MANIFEST,
  AUTO_REGISTRATION,
  ISSUES,
  GITHUB_LINK,
  FLAGS,
  GIT_HASH,
  IS_PROD,
  IS_ANDROID,
  ELECTRON_MAIN_FILE,
  IS_ELECTRON,
  SERVICE_WORKER_URL,
  ELECTRON_IGNORE_SSL,
  CAPTCHA_IFRAME,
  WEBRTC_CONFIG,
} = allConsts;

export const PING_CLOSE_JS_DELAY = 5000;
export const CONNECTION_RETRY_TIME = 5000;
export const CLIENT_NO_SERVER_PING_CLOSE_TIMEOUT = 313000;
export const RESPONSE_SUCCESS = 'ok';
export const ALLOW_EDIT_MESSAGE_IF_UPDATE_HAPPENED_MS_AGO = 24 * 60 * 60 * 1000; // 1 day
export const ALL_ROOM_ID = 1;
export const CHROME_EXTENSION_ID = 'cnlplcfdldebgdlcmpkafcialnbopedn';
export const CHROME_EXTENSION_URL = `https://chrome.google.com/webstore/detail/pychat-screensharing-exte/${CHROME_EXTENSION_ID}`;
export const PASTED_IMG_CLASS = 'B4j2ContentEditableImg';
export const MESSAGES_PER_SEARCH = 10;
export const CONNECTION_ERROR = `Connection error`;
export const LAST_SYNCED = 'lastSynced';
export const SEND_CHUNK_SIZE = 16384;
export const READ_CHUNK_SIZE = SEND_CHUNK_SIZE * 64;
export const MAX_BUFFER_SIZE = 256;
export const SERVICE_WORKER_VERSION = 3;
export const SERVICE_WORKER_VERSION_LS_NAME = 'serviceWorkerVersion';
export const USERNAME_REGEX = '[a-zA-Z-_0-9]{1,16}';
export const SHOW_I_TYPING_INTERVAL = 5_000;
export const MAX_ACCEPT_FILE_SIZE_WO_FS_API = 268435456; // Math.pow(2, 28) = 256 MB
