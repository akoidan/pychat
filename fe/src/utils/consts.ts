// webpack global consts
declare const PYCHAT_CONSTS: any;

let allConsts = PYCHAT_CONSTS;
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
  GIT_HASH,
  IS_PROD,
  ELECTRON_MAIN_FILE,
  SERVICE_WORKER_URL,
  ELECTRON_IGNORE_SSL,
  CAPTCHA_IFRAME
} = allConsts;

export const WS_API_URL = `ws${IS_SSL ? 's' : ''}://${BACKEND_ADDRESS}/ws`;
export const XHR_API_URL = `http${IS_SSL ? 's' : ''}://${BACKEND_ADDRESS}/api`;
export const MEDIA_API_URL = `http${IS_SSL ? 's' : ''}://${BACKEND_ADDRESS}`;

export const GITHUB_URL = 'https://github.com/Deathangel908/pychat';
export const PING_CLOSE_JS_DELAY = 5000;
export const CONNECTION_RETRY_TIME = 5000;
export const CLIENT_NO_SERVER_PING_CLOSE_TIMEOUT = 313000;
export const RESPONSE_SUCCESS = 'ok';
export const ALL_ROOM_ID = 1;
export const CHROME_EXTENSION_ID = 'cnlplcfdldebgdlcmpkafcialnbopedn';
export const CHROME_EXTENSION_URL = 'https://chrome.google.com/webstore/detail/pychat-screensharing-exte/' + CHROME_EXTENSION_ID;
export const PASTED_IMG_CLASS = 'B4j2ContentEditableImg';
export const MESSAGES_PER_SEARCH = 10;
export const CONNECTION_ERROR = `Connection error`;
export const SEND_CHUNK_SIZE = 16384;
export const READ_CHUNK_SIZE = SEND_CHUNK_SIZE * 64;
export const MAX_BUFFER_SIZE = 256;
export const MAX_ACCEPT_FILE_SIZE_WO_FS_API = 268435456; // Math.pow(2, 28) = 256 MB
