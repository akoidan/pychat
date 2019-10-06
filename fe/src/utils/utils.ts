import {store} from '@/utils/storeHolder';
import router from '@/utils/router';
import sessionHolder from '@/utils/sessionHolder';
import {api, channelsHandler, globalLogger, storage, webrtcApi, ws} from '@/utils/singletons';
import {CurrentUserInfoModel, EditingMessage, MessageModel, RoomModel} from '@/types/model';
import loggerFactory from '@/utils/loggerFactory';
import {
  ALL_ROOM_ID,
  FACEBOOK_APP_ID,
  GOOGLE_OAUTH_2_CLIENT_ID,
} from '@/utils/consts';
import {StorageData} from '@/types/types';

let logger = loggerFactory.getLoggerColor('utils', '#007a70');

export function logout(errMessage: string) {
  store.logout();
  if (errMessage) {
    store.growlError( errMessage);
  }
  webrtcApi.closeAllConnections();
  sessionHolder.session = '';
  router.replace('/auth/login');
  ws.stopListening();
  channelsHandler.removeAllSendingMessages();
}

export function getDay(dateObj: Date) {
  let month = dateObj.getUTCMonth() + 1; // months from 1-12
  let day = dateObj.getUTCDate();
  let year = dateObj.getUTCFullYear();
  return `${year}/${month}/${day}`;
}

export function bounce(ms: number): (cb: Function) => void {
  let stack: number | null;
  let lastCall: Function;
  return function(cb) {
    lastCall = cb;
    if (!stack) {
      stack = window.setTimeout(() => {
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
    globalLogger.log('restored state from db {}, userId: {}, session {}', data, store.userInfo && store.userInfo.userId, session)();
    if (data) {
      if (!store.userInfo && session) {
        store.init(data.setRooms);
      } else {
        store.roomsArray.forEach((storeRoom: RoomModel) => {
          if (data.setRooms.roomsDict[storeRoom.id]) {
            let dbMessages: {[id: number]: MessageModel} = data.setRooms.roomsDict[storeRoom.id].messages;
            for (let dbMessagesKey in dbMessages) {
              if (!storeRoom.messages[dbMessagesKey])
              store.addMessage(dbMessages[dbMessagesKey]);
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

export function login(session: string, errMessage: string) {
  if (errMessage) {
    store.growlError( errMessage);
  } else if (/\w{32}/.exec(session)) {
    sessionHolder.session = session;
    logger.log('Proceeding to /')();
    router.replace(`/chat/${ALL_ROOM_ID}`);
  } else {
    store.growlError( session);
  }
}

declare const gapi: any;
declare const FB: any;

let googleInited: boolean = false;
let fbInited: boolean = false;


export function  extractError (args: unknown |unknown[]| {name: string}) {
  try {
    let value: { name: string, message: string, rawError: string } = args as { name: string, message: string, rawError: string };
    if (typeof args === 'string') {
      return args;
    } else if ((<unknown[]>args).length > 1) {
      return Array.prototype.join.call(args, ' ');
    } else if ((<unknown[]>args).length === 1) {
      value = (<unknown[]>args)[0] as { name: string, message: string, rawError: string };
    }
    if (value && (value.name || value.message) ) {
      return `${value.name}: ${value.message}`;
    } else if (value.rawError) {
      return value.rawError;
    } else {
      return JSON.stringify(value);
    }
  } catch (e) {
    return `Error during parsing error ${e}, :(`;
  }
}

export function getChromeVersion () {
  let raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
  return raw ? parseInt(raw[2], 10) : false;
}

export function initGoogle(cb: Function) {
  if (!googleInited && GOOGLE_OAUTH_2_CLIENT_ID) {
    logger.log('Initializing google sdk')();
    api.loadGoogle((e: string) => {
      if (typeof gapi.load !== 'function') { // TODO
        throw Error(`Gapi doesnt have load function ${JSON.stringify(Object.keys(gapi))}`);
      }
      gapi.load('client:auth2', () => {
        logger.log('gapi 2 is ready')();
        gapi.auth2.init({client_id: GOOGLE_OAUTH_2_CLIENT_ID}).then(() => {
          logger.log('gauth 2 is ready')();
          googleInited = true;
          cb();
        }).catch((e: string) => {
          logger.error('Unable to init google {}', e)();
          cb(e);
        });
      });
    });
  } else {
    cb();
  }
}

export function initFaceBook(cb: Function) {
  if (!fbInited && FACEBOOK_APP_ID) {
    api.loadFacebook((e: unknown) => {
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


export function sem(event: MouseEvent, message: MessageModel, isEditingNow: boolean, userInfo: CurrentUserInfoModel, setEditedMessage: SingleParamCB<EditingMessage>) {
  logger.debug('sem {}', message.id)();
  if (event.target
      && (<HTMLElement>event.target).tagName !== 'IMG'
      && message.userId === userInfo.userId
      && !message.deleted
      && message.time + ONE_DAY > Date.now()
  ) {
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
