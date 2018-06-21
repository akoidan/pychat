import {
  AddOnlineUser,
  DeleteMessage,
  DeleteRoom,
  EditMessage,
  LeaveUser,
  LoadMessages,
  RemoveOnlineUser,
  RoomDTO
} from './dto';
import loggerFactory from './loggerFactory';
import {Store} from 'vuex';
import Api from './api';
import MessageHandler from './MesageHandler';
import {Logger, MessageLocation, SetRoomsUsers} from '../types';
import {MessageModel, RoomModel, RootState, UserModel} from '../model';


export default class ChannelsHandler extends MessageHandler {
  private logger: Logger;
  private store: Store<RootState>;
  private api: Api;
  private handlers = {
    loadMessages(lm: LoadMessages) {
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
    },
    deleteMessage(message: DeleteMessage) {
      this.store.commit('deleteMessage', message);
    },
    editMessage(message: EditMessage) {
      this.store.commit('editMessage', this.getMessage(message));
    },
    addOnlineUser(message: AddOnlineUser) {
      if (!this.store.state.allUsers[message.userId]) {
        this.store.commit('addUser', {userId: message.userId, user: message.user, sex: message.sex});
      }
      this.store.commit('setOnline', message.content);
    },
    removeOnlineUser(message: RemoveOnlineUser) {
      this.store.commit('setOnline', message.content);
    },
    printMessage(message: EditMessage) {
      let messsage = this.getMessage(message);
      this.store.commit('addMessage', messsage);
    },
    deleteRoom(message: DeleteRoom) {
      this.store.commit('deleteRoom', message.roomId);
    },
    leaveUser(message: LeaveUser) {
      let m: SetRoomsUsers = {
        roomId: message.roomId,
        users: message.users
      };
      this.store.commit('setRoomsUsers', m);
    }
  };

  constructor(store: Store<RootState>, api: Api) {
    super();
    this.store = store;
    this.api = api;
    this.logger = loggerFactory.getLogger('CHAT', 'color: #FF0F00; font-weight: bold');
  }

  protected getMethodHandlers() {
    return this.handlers;
  }

  public setUsers(users: {[id: string]: UserModel}) {
    this.store.commit('setUsers', users);
  }


  private getMessage(message: EditMessage): MessageModel {
    return {
      id: message.id,
      time: message.time,
      files: message.files || null,
      content: message.content || null,
      symbol: message.symbol || null,
      edited: message.edited || null,
      roomId: message.roomId,
      userId: message.userId,
      giphy: message.giphy || null,
      deleted: message.deleted || null
    };
  }


  public setRooms(rooms: {[id: string]: RoomDTO}) {
    this.logger.debug('Setting rooms')();
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


}
