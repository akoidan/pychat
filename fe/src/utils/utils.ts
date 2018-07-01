import store from '../store';
import router from '../router';
import sessionHolder from './sessionHolder';
import {channelsHandler, globalLogger, ws} from './singletons';
import {CurrentUserInfoModel, EditingMessage, MessageModel, RootState} from '../types/model';

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
    globalLogger.log('Proceeding to /')();
    router.replace('/chat/1');
  } else {
    store.dispatch('growlError', session);
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
  globalLogger.debug('sem {}', message.id)();
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
