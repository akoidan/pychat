// webpack global consts
declare const WS_API_URL: string;
declare const STATIC_API_URL: string;
declare const XHR_API_URL: string;
declare const IS_DEBUG: boolean;

const _WS_API_URL = WS_API_URL;
const _STATIC_API_URL = STATIC_API_URL;
const _XHR_API_URL = XHR_API_URL;
const _IS_DEBUG = XHR_API_URL;

export const PING_CLOSE_JS_DELAY = 5000;
export const CONNECTION_RETRY_TIME = 5000;
export const CLIENT_NO_SERVER_PING_CLOSE_TIMEOUT = 313000;
export {_WS_API_URL as WS_API_URL};
export {_STATIC_API_URL as STATIC_API_URL};
export {_XHR_API_URL as XHR_API_URL};
export {_IS_DEBUG as IS_DEBUG};
export const RESPONSE_SUCCESS = 'ok';
export const PASTED_IMG_CLASS = 'B4j2ContentEditableImg';
export const MESSAGES_PER_SEARCH = 10;