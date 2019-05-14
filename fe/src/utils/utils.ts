import store from '../store';
import router from '../router';
import sessionHolder from './sessionHolder';
import {api, channelsHandler, globalLogger, storage, webrtcApi, ws} from './singletons';
import {CurrentUserInfoModel, EditingMessage, MessageModel, RoomModel} from '../types/model';
import loggerFactory from './loggerFactory';
import {
  ALL_ROOM_ID,
  FACEBOOK_APP_ID,
  GOOGLE_OAUTH_2_CLIENT_ID,
  XHR_API_URL
} from './consts';
import {StorageData} from '../types/types';

let logger = loggerFactory.getLoggerColor('utils', '#007a70');

export function logout(errMessage: string) {
  store.commit('logout');
  if (errMessage) {
    store.dispatch('growlError', errMessage);
  }
  webrtcApi.closeAllConnections();
  sessionHolder.session = '';
  router.replace('/auth/login');
  ws.stopListening();
  channelsHandler.removeAllSendingMessages();
}
export function forEach(array, cb) {
  if (array && array.length) {
    for (let i = 0; i < array.length; i++) {
      cb(array[i]);
    }
  }
}

export function getUrl(url: string): string {
  if (!url) {
  } else if (/^https?:\/\//.exec(url) || (url && url.indexOf('//') === 0) /*cdn*/) {
    return url;
  } else {
    return XHR_API_URL + url;
  }
}

export function getDay(dateObj) {
  let month = dateObj.getUTCMonth() + 1; // months from 1-12
  let day = dateObj.getUTCDate();
  let year = dateObj.getUTCFullYear();
  return `${year}/${month}/${day}`;
}

export function bounce(ms): (cb) => void {
  let stack;
  let lastCall;
  return function(cb) {
    lastCall = cb;
    if (!stack) {
      stack = setTimeout(() => {
        stack = null;
        lastCall();
      }, ms);
    }
  };
}
export async function initStore() {
  let isNew = await storage.connect();
  if (!isNew) {
    let data: StorageData = await storage.getAllTree();
    let session = sessionHolder.session;
    globalLogger.log('restored state from db {}, userId: {}, session {}', data, store.state.userInfo && store.state.userInfo.userId, session)();
    if (data) {
      if (!store.state.userInfo && session) {
        store.commit('init', data.setRooms);
      } else {
        store.getters.roomsArray.forEach((storeRoom: RoomModel) => {
          if (data.setRooms.roomsDict[storeRoom.id]) {
            let dbMessages: {[id: number]: MessageModel} = data.setRooms.roomsDict[storeRoom.id].messages;
            for (let dbMessagesKey in dbMessages) {
              if (!storeRoom.messages[dbMessagesKey])
              store.commit('addMessage', dbMessages[dbMessagesKey]);
            }
          }
        });
        globalLogger.debug('Skipping settings state {}', data.setRooms)();
      }
      if (session) {
        globalLogger.debug('Appending sending messages {}', data.sendingMessages)();
        data.sendingMessages.forEach((m: MessageModel) => {
          if (m.content && m.id > 0) {
            channelsHandler.sendEditMessage(m.content, m.roomId, m.id, []);
          } else if (m.content) {
            channelsHandler.sendSendMessage(m.content, m.roomId, [], ws.getMessageId(), m.time);
          } else if (m.id > 0) {
            channelsHandler.sendDeleteMessage(m.id, ws.getMessageId());
          }
        });
      } else {
        globalLogger.debug('No pending messages found')();
      }
    }
  }
}

export function login(session, errMessage) {
  if (errMessage) {
    store.dispatch('growlError', errMessage);
  } else if (/\w{32}/.exec(session)) {
    sessionHolder.session = session;
    logger.log('Proceeding to /')();
    router.replace(`/chat/${ALL_ROOM_ID}`);
  } else {
    store.dispatch('growlError', session);
  }
}

declare const gapi: any;
declare const FB: any;

let googleInited: boolean = false;
let fbInited: boolean = false;
let captchaInited: boolean = false;


export function loadCaptcha(cb) {
  if (captchaInited) {
    cb();
  } else {
    api.loadRecaptcha(cb2 => {
      captchaInited = true;
      cb();
    });
  }
}


export function  extractError (args) {
  try {
    if (typeof args === 'string') {
      return args;
    } else if (args.length > 1) {
      return Array.prototype.join.call(args, ' ');
    } else if (args.length === 1) {
      args = args[0];
    }
    if (args && (args.name || args.message) ) {
      return `${args.name}: ${args.message}`;
    } else if (args.rawError) {
      return args.rawError;
    } else {
      return JSON.stringify(args);
    }
  } catch (e) {
    return `Error during parsing error ${e}, :(`;
  }
}

export function getChromeVersion () {
  let raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
  return raw ? parseInt(raw[2], 10) : false;
}

export function initGoogle(cb) {
  if (!googleInited && GOOGLE_OAUTH_2_CLIENT_ID) {
    logger.log('Initializing google sdk')();
    api.loadGoogle((e) => {
      if (typeof gapi.load !== 'function') { // TODO
        throw Error(`Gapi doesnt have load function ${JSON.stringify(Object.keys(gapi))}`);
      }
      gapi.load('client:auth2', () => {
        logger.log('gapi 2 is ready')();
        gapi.auth2.init({client_id: GOOGLE_OAUTH_2_CLIENT_ID}).then(() => {
          logger.log('gauth 2 is ready')();
          googleInited = true;
          cb();
        }).catch(e => {
          logger.error('Unable to init google {}', e)();
          cb(e);
        });
      });
    });
  } else {
    cb();
  }
}

export function initFaceBook(cb) {
  if (!fbInited && FACEBOOK_APP_ID) {
    api.loadFacebook(e => {
      logger.log('Initing facebook sdk...')();
      FB.init({
        appId: FACEBOOK_APP_ID,
        xfbml: true,
        version: 'v2.7'
      });
      fbInited = true;
      cb();
    });
  } else {
    cb();
  }
}

export function bytesToSize(bytes: number): string {
  let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes < 1) return '0 Byte';
  let power: number = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, power))} ${sizes[power]}`;
}



const ONE_DAY = 24 * 60 * 60 * 1000;


export function sem(event, message: MessageModel, isEditingNow: boolean, userInfo: CurrentUserInfoModel, setEditedMessage: SingleParamCB<EditingMessage>) {
  logger.debug('sem {}', message.id)();
  if (event.target.tagName !== 'IMG' && message.userId === userInfo.userId && !message.deleted && message.time + ONE_DAY > Date.now()) {
    event.preventDefault();
    event.stopPropagation();
    let newlet: EditingMessage = {
      messageId: message.id,
      isEditingNow,
      roomId: message.roomId
    };
    setEditedMessage(newlet);
  }
}
