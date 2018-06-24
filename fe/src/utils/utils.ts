import store from '../store';
import router from '../router';
import sessionHolder from './sessionHolder';
import {globalLogger, ws} from './singletons';
import {CurrentUserInfoModel, EditingMessage, MessageModel, RootState} from '../types/model';

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



const ONE_DAY = 24 * 60 * 60 * 1000;


export function sem(event, message: MessageModel, isEditingNow: boolean, userInfo: CurrentUserInfoModel, setEditedMessage: SingleParamCB<EditingMessage>) {
  if (message.userId === userInfo.userId && !message.deleted && message.time + ONE_DAY > Date.now()) {
    event.preventDefault();
    event.stopPropagation();
    setEditedMessage({messageId: message.id, isEditingNow, roomId: message.roomId} as EditingMessage);
  }
}


export function getMessageById(state: RootState, roomId: number, messageId: number): MessageModel {
  return state.roomsDict[roomId].messages.find(r => r.id === messageId);
}