import store from '../store';
import router from '../router';
import sessionHolder from './sessionHolder';
import {api, channelsHandler, ws} from './singletons';
import {CurrentUserInfoModel, EditingMessage, MessageModel} from '../types/model';
import loggerFactory from './loggerFactory';
import {FACEBOOK_APP_ID, GOOGLE_OAUTH_2_CLIENT_ID} from './consts';

let logger = loggerFactory.getLoggerColor('utils', '#007a70');

export function logout(errMessage: string) {
  store.commit('logout');
  if (errMessage) {
    store.dispatch('growlError', errMessage);
  }
  sessionHolder.session = '';
  router.replace('/auth/login');
  ws.stopListening();
  channelsHandler.removeAllSendingMessages();
}

export function login(session, errMessage) {
  if (errMessage) {
    store.dispatch('growlError', errMessage);
  } else if (/\w{32}/.exec(session)) {
    sessionHolder.session = session;
    logger.log('Proceeding to /')();
    router.replace('/chat/1');
  } else {
    store.dispatch('growlError', session);
  }
}

declare const gapi: any;
declare const FB: any;

let googleInited: boolean = false;
let fbInited: boolean = false;
let captchaInited: boolean = false;



export function getOppositeUserIdInPrivateRoom(myId: number, users: number[]): number {
  return myId === users[0] && users.length === 2 ? users[1] : users[0];
}


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

export function initGoogle(cb) {
  if (!googleInited && GOOGLE_OAUTH_2_CLIENT_ID) {
    logger.log('Initializing google sdk')();
    api.loadGoogle(() => {
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
  if (message.userId === userInfo.userId && !message.deleted && message.time + ONE_DAY > Date.now()) {
    event.preventDefault();
    event.stopPropagation();
    let newVar: EditingMessage = {
      messageId: message.id,
      isEditingNow,
      roomId: message.roomId
    };
    setEditedMessage(newVar);
  }
}
