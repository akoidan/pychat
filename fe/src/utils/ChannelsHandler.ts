import {Logger} from './Logger';
import {ChatHandlerMessage, DefaultMessage, MessageHandler, RoomModel, RootState, SexModel, UserModel} from '../types';
import loggerFactory from './loggerFactory';
import ChatHandler from './ChatHandler';
import {Store} from 'vuex';

interface AddOnlineUser extends DefaultMessage {
  content: number[];
  sex: SexModel;
  user: string;
  userId: number;
}
export default class ChannelsHandler implements MessageHandler {
  private logger: Logger;
  private dbMessages: Array<any>;
  private chatHandlers: { [id: number]: ChatHandler };
  private store: Store<RootState>;

  constructor(store: Store<RootState>) {
    this.store = store;
    this.logger = loggerFactory.getLogger('CHAT', 'color: #FF0F00; font-weight: bold');
  }

  public setUsers(users: {[id: string]: UserModel}) {
    this.store.commit('setUsers', users);
  }

  public setRooms(rooms: {[id: string]: RoomModel}) {
    this.store.commit('setRooms', rooms);
  }

  public setOnline(online: number[]) {
    this.store.commit('setOnline', online);
  }

  public handle(message: DefaultMessage) {
    if (message.handler === 'channels') {
      this[`handle${message.action}`](message);
    } else if (message.handler === 'chat') {
      let chm: ChatHandlerMessage = message as ChatHandlerMessage;
      let channelHandler: ChatHandler = this.chatHandlers[chm.roomId];
      if (channelHandler) {
        channelHandler.handle(chm);
      } else {
        throw `Unknown channel ${chm.roomId} for message "${JSON.stringify(message)}"`;
      }
    }
  }
  handleaddOnlineUser(message: AddOnlineUser) {
    if (!this.store.state.allUsers[message.userId]) {
      this.store.commit('addUser', {userId: message.userId, user: message.user, sex: message.sex});
    }
    this.store.commit('setOnline', message.content);
  }

}
