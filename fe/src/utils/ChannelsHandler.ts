import {Logger} from './Logger';
import {RoomModel, RootState, UserModel} from '../types';
import {AddOnlineUser, DefaultMessage, LoadMessages, MessageHandler, RoomDTO} from './dto';
import loggerFactory from './loggerFactory';
import {Store} from 'vuex';


export default class ChannelsHandler implements MessageHandler {
  private logger: Logger;
  private store: Store<RootState>;

  constructor(store: Store<RootState>) {
    this.store = store;
    this.logger = loggerFactory.getLogger('CHAT', 'color: #FF0F00; font-weight: bold');
  }

  public setUsers(users: {[id: string]: UserModel}) {
    this.store.commit('setUsers', users);
  }

  private handleloadMessages(lm: LoadMessages) {
    if (lm.content.length > 0) {
      let messages = this.store.state.rooms[lm.roomId].messages;
      let oldMessages = {};
      messages.forEach(m => {
        oldMessages[m.id] = true;
      });
      lm.content.filter(i => oldMessages[i.id]);
      messages = messages.concat(lm.content);
      messages.sort((a, b) => a.time > b.time ? 1 : a.time < b.time ? -1 : 0);
      this.store.commit('setMessages', {messages, roomId: lm.roomId});
    } else {
      this.store.commit('setAllLoaded', lm.roomId);
    }
  }

  handleaddOnlineUser(message: AddOnlineUser) {
    if (!this.store.state.allUsers[message.userId]) {
      this.store.commit('addUser', {userId: message.userId, user: message.user, sex: message.sex});
    }
    this.store.commit('setOnline', message.content);
  }

  public setRooms(rooms: {[id: string]: RoomDTO}) {
    let dict: { [id: number]: RoomModel } = {};
    for (let id in rooms) {
      let oldRoom = this.store.state.rooms[id];
      let newRoom = rooms[id];
      if (oldRoom) {
        dict[id] = {
          messages: oldRoom.messages,
          name: newRoom.name,
          notifications: newRoom.notifications,
          users: newRoom.users,
          volume: newRoom.volume,
          allLoaded: oldRoom.allLoaded
        };
      } else {
        dict[id] = {
          messages: [],
          name: newRoom.name,
          notifications: newRoom.notifications,
          users: newRoom.users,
          volume: newRoom.volume,
          allLoaded: false
        };
      }
    }
    this.store.commit('setRooms', dict);
  }

  public setOnline(online: number[]) {
    this.store.commit('setOnline', online);
  }



  public handle(message: DefaultMessage) {
    if (message.handler === 'channels') {
      this[`handle${message.action}`](message);
    } else if (message.handler === 'chat') {
      alert('oops');
    }
  }

}
