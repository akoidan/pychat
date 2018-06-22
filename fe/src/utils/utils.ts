import store from '../store';
import router from '../router';
import sessionHolder from './sessionHolder';
import {globalLogger, ws} from './singletons';
import {MessageModel, RoomModel, RootState} from '../model';

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

export function getMessageById(state: RootState, roomId: number, messageId: number): MessageModel {
  return state.roomsDict[roomId].messages.find(r => r.id === messageId);
}