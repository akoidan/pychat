import store from '../store';
import router from '../router';
import sessionHolder from './sessionHolder';
import {globalLogger, ws} from './singletons';
import {CurrentUserInfoModel, EditingMessage, MessageModel, RootState, SentMessageModel} from '../types/model';

export function logout(errMessage: string) {
  store.dispatch('logout');
  if (errMessage) {
    store.dispatch('growlError', errMessage);
  }
  sessionHolder.session = '';
  router.replace('/auth/login');
  ws.stopListening();
}

export function login(session, errMessage) {
  if (errMessage) {
    store.dispatch('growlError', errMessage);
  } else {
    sessionHolder.session = session;
    globalLogger.log('Proceeding to /')();
    router.replace('/chat/1');
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
    let originId: number = null;
    if (message['originId']) {
      let sm: SentMessageModel = message as SentMessageModel;
      originId = sm.id;
    }
    let newVar: EditingMessage = {
      messageId: message.id,
      isEditingNow,
      originId,
      roomId: message.roomId
    };
    setEditedMessage(newVar);
  }
}


export function getMessageById(state: RootState, roomId: number, messageId: number): MessageModel {
  return state.roomsDict[roomId].messages.find(r => r.id === messageId);
}