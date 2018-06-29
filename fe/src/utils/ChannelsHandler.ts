import loggerFactory from './loggerFactory';
import {Store} from 'vuex';
import Api from './api';
import MessageHandler from './MesageHandler';
import {
  AddMessagePayload,
  MessagesLocation,
  RemoveMessageProgress,
  RemoveSendingMessage,
  SetMessageProgress,
  SetMessageProgressError,
  SetRoomsUsers, SetUploadProgress,
  UploadFile
} from '../types/types';
import {
  MessageModel,
  RoomDictModel,
  RoomModel,
  RootState,
   UploadProgressModel,
  UserDictModel,
  UserModel
} from '../types/model';
import {Logger} from 'lines-logger';
import {
  AddInviteMessage,
  AddOnlineUserMessage,
  AddRoomBase,
  AddRoomMessage,
  DeleteMessage,
  DeleteRoomMessage,
  EditMessage,
  InviteUserMessage,
  LeaveUserMessage,
  LoadMessages,
  RemoveOnlineUserMessage
} from '../types/messages';
import {MessageModelDto, RoomDto, UserDto} from '../types/dto';
import {convertFiles, convertUser} from '../types/converters';
import {WsHandler} from './WsHandler';


export default class ChannelsHandler extends MessageHandler {
  private logger: Logger;
  private store: Store<RootState>;
  private api: Api;
  private ws: WsHandler;
  private sendingMessage: {} = {};

  public seWsHandler(ws: WsHandler) {
    this.ws = ws;
  }

  constructor(store: Store<RootState>, api: Api) {
    super();
    this.store = store;
    this.api = api;
    this.logger = loggerFactory.getLoggerColor('chat', '#940500');
  }

  private handlers = {
    loadMessages(lm: LoadMessages) {
      if (lm.content.length > 0) {
        this.addMessages(lm.roomId, lm.content);
      } else {
        this.store.commit('setAllLoaded', lm.roomId);
      }
    },
    deleteMessage(inMessage: DeleteMessage) {
      let message: MessageModel = this.store.state.roomsDict[inMessage.roomId].messages[inMessage.id];
      if (!message) {
        this.logger.debug('Unable to find message {} to delete it', inMessage)();
      } else {
        let message: MessageModel = this.getMessage(inMessage);
        message.deleted = true;
        this.logger.debug('Adding message to storage {}', message)();
        this.store.commit('editMessage', message);
        if (inMessage.cbBySender === this.ws.getWsConnectionId()) {
          let removed = this.removeSendingMessage(inMessage.messageId);
        }
      }
    },
    editMessage(inMessage: EditMessage) {
      let message: MessageModel = this.store.state.roomsDict[inMessage.roomId].messages[inMessage.id];
      if (!message) {
        this.logger.debug('Unable to find message {} to edit it', inMessage)();
      } else {
        let message: MessageModel = this.getMessage(inMessage);
        this.logger.debug('Adding message to storage {}', message)();
        this.store.commit('editMessage', message);
        if (inMessage.cbBySender === this.ws.getWsConnectionId()) {
          let removed = this.removeSendingMessage(inMessage.messageId);
        }
      }
    },
    addOnlineUser(message: AddOnlineUserMessage) {
      if (!this.store.state.allUsersDict[message.userId]) {
        let newVar: UserModel = convertUser(message);
        this.store.commit('addUser', newVar);
      }
      this.store.commit('setOnline', [...message.content]);
    },
    removeOnlineUser(message: RemoveOnlineUserMessage) {
      this.store.commit('setOnline', message.content);
    },
    printMessage(inMessage: EditMessage) {
      let message: MessageModel = this.store.state.roomsDict[inMessage.roomId].messages[inMessage.id];
      if (message) {
        this.logger.debug('Skipping printing message {}, because it\'s already in list', inMessage.id)();
      } else {
        let message: MessageModel = this.getMessage(inMessage);
        this.logger.debug('Adding message to storage {}', message)();
        this.store.commit('addMessage', message);
        if (inMessage.cbBySender === this.ws.getWsConnectionId()) {
          this.removeSendingMessage(inMessage.messageId);
          let rmMes: RemoveSendingMessage = {
            messageId: inMessage.messageId,
            roomId: inMessage.roomId
          };
          this.store.commit('deleteMessage', rmMes);
        }
      }
    },
    deleteRoom(message: DeleteRoomMessage) {
      if (this.store.state.roomsDict[message.roomId]) {
        this.store.commit('deleteRoom', message.roomId);
      } else {
        this.logger.error('Unable to find room {} to delete', message.roomId)();
      }
    },
    leaveUser(message: LeaveUserMessage) {
      if (this.store.state.roomsDict[message.roomId]) {
        let m: SetRoomsUsers = {
          roomId: message.roomId,
          users: message.users
        };
        this.store.commit('setRoomsUsers', m);
      } else {
        this.logger.error('Unable to find room {} to kick user', message.roomId)();
      }
    },
    addRoom(message: AddRoomMessage) {
      this.mutateRoomAddition(message);
    },
    inviteUser(message: InviteUserMessage) {
      this.store.commit('setRoomsUsers', {roomId: message.roomId, users: message.users} as SetRoomsUsers);
    },
    addInvite(message: AddInviteMessage) {
      this.mutateRoomAddition(message);
    },
  };


  private resendMessages() {
    for (let k in this.sendingMessage) {
      this.resendMessage(k);
    }
  }

  public removeSendingMessage(messageId) {
    if (this.sendingMessage[messageId]) {
      delete this.sendingMessage[messageId];
      return true;
    } else {
      this.logger.warn('Got unknown message {}', messageId)();
      return false;
    }
  }

  public resendMessage(id) {
    this.logger.log('resending message {} ', id)();
    let cb = this.sendingMessage[id].cb;
    cb();
  }

  public getMessageFiles(messageId): UploadFile[] {
    if (this.sendingMessage[messageId]) {
      return this.sendingMessage[messageId].files;
    } else {
      this.logger.error('Asking for unkown files {}', messageId);
      return [];
    }
  }

  private uploadAndSend(originId: number, cbWs, cbMethod, uploadfiles: UploadFile[], roomId: number): void {
    let send = (filesIds: number[]) => {
      this.sendingMessage[originId] = {
        cb: cbWs(filesIds),
        files: uploadfiles
      };
      this.sendingMessage[originId].cb();
    };
    if (uploadfiles.length) {
      this.uploadFiles(originId, roomId, uploadfiles, (filesIds: number[]) => {
        if (filesIds) {
          send(filesIds);
        } else {
          this.sendingMessage[originId] = {
            cb: cbMethod,
            files: uploadfiles
          };
        }
      });
    } else {
      send([]);
    }
  }

  public sendDeleteMessage(id: number, originId: number): void {
    this.sendingMessage[originId] = {
      cb: () => this.ws.sendEditMessage(null, id, null, originId),
    };
    this.sendingMessage[originId].cb();
  }

  public sendEditMessage(content: string, roomId: number, id: number, uploadfiles: UploadFile[]): void {
    this.uploadAndSend(id, (filesIds) => {
      return () => this.ws.sendEditMessage(content, id, filesIds, id);
    }, () => {
      this.sendEditMessage(content, roomId, id, uploadfiles);
    }, uploadfiles, roomId);
  }

  public sendSendMessage(
      content: string,
      roomId: number,
      uploadfiles: UploadFile[],
      originId: number,
      originTime
  ):  void {
    this.uploadAndSend(originId, (filesIds) => {
      return () => this.ws.sendSendMessage(content, roomId, filesIds, originId, Date.now() - originTime);
    }, () => {
      this.sendSendMessage(content, roomId, uploadfiles, originId, originTime);
    }, uploadfiles, roomId);
  }

  public uploadFiles(
      messageId: number,
      roomId: number,
      files: UploadFile[],
      cb: SingleParamCB<number[]>
  ): void {
    let size: number = 0;
    files.forEach(f => size += f.file.size);
    this.api.uploadFiles(files, (res: number[], error: string) => {
      if (error) {
        let newVar: SetMessageProgressError = {
          messageId,
          roomId,
          error,
        };
        this.store.commit('setMessageProgressError', newVar);
        cb(null);
      } else {
        let newVar: RemoveMessageProgress = {
          messageId, roomId
        };
        this.store.commit('removeMessageProgress', newVar);
        cb(res);
      }
    }, evt => {
      if (evt.lengthComputable) {
        let newVar: SetMessageProgress = {
          messageId,
          roomId,
          total: evt.total,
          uploaded: evt.loaded
        };
        this.store.commit('setMessageProgress', newVar);
      }
    });
    let sup: SetUploadProgress = {
      upload: {
        error: null,
        total: size,
        uploaded: 0
      },
      messageId,
      roomId
    };
    this.store.commit('setUploadProgress', sup);
  }

  private mutateRoomAddition(message: AddRoomBase) {
    let r: RoomModel = {
      id: message.roomId,
      volume: message.volume,
      notifications: message.notifications,
      name: message.name,
      messages: {},
      allLoaded: false,
      search: {
        searchActive: false,
        searchText: '',
        searchedIds: [],
        locked: false,
      },
      users: message.users
    };
    this.store.commit('addRoom', r);
  }

  public addMessages(roomId: number, inMessages: MessageModelDto[]) {
    let oldMessages: { [id: number]: MessageModel } = this.store.state.roomsDict[roomId].messages;
    let newMesages: MessageModelDto[] = inMessages.filter(i => !oldMessages[i.id]);
    let messages: MessageModel[] = newMesages.map(this.getMessage.bind(this));
    this.store.commit('addMessages', {messages, roomId: roomId} as MessagesLocation);
  }

  protected getMethodHandlers() {
    return this.handlers;
  }

  public setUsers(users: UserDto[]) {
    this.logger.debug('set users {}', users)();
    let um: UserDictModel = {};
    users.forEach(u => {
      um[u.userId] = convertUser(u);
    });
    this.store.commit('setUsers', um);
  }



  private getMessage(message: EditMessage): MessageModel {
    return {
      id: message.id,
      time: message.time,
      files: message.files ? convertFiles(message.files) : null,
      content: message.content || null,
      symbol: message.symbol || null,
      edited: message.edited || null,
      roomId: message.roomId,
      userId: message.userId,
      upload: null,
      sending: false,
      giphy: message.giphy || null,
      deleted: message.deleted || null
    };
  }


  public setRooms(rooms: RoomDto[]) {
    this.logger.debug('Setting rooms')();
    let storeRooms: RoomDictModel = {};
    let roomsDict: RoomDictModel = this.store.state.roomsDict;
    rooms.forEach((newRoom: RoomDto) => {
      let oldRoom = roomsDict[newRoom.roomId];
      let rm: RoomModel = {
        id: newRoom.roomId,
        messages: oldRoom ? oldRoom.messages : {},
        name: newRoom.name,
        search: oldRoom ? oldRoom.search : {
          searchActive: false,
          searchText: '',
          searchedIds: [],
          locked: false
        },
        notifications: newRoom.notifications,
        users: [...newRoom.users],
        volume: newRoom.volume,
        allLoaded: oldRoom ? oldRoom.allLoaded : false
      };
      storeRooms[rm.id] = rm;
    });
    this.resendMessages();
    this.store.commit('setRooms', storeRooms);
  }

  public setOnline(online: number[]) {
    this.store.commit('setOnline', [...online]);
  }


}
