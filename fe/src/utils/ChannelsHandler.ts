import loggerFactory from '@/utils/loggerFactory';
import Api from '@/utils/api';
import Vue from 'vue';
import MessageHandler from '@/utils/MesageHandler';
import {checkAndPlay, incoming, login, logout, outgoing} from '@/utils/audio';
import faviconUrl from '@/assets/img/favicon.ico';


import {
  ChangeOnlineEntry,
  PubSetRooms,
  RemoveMessageProgress,
  RemoveSendingMessage,
  SetMessageProgress,
  SetMessageProgressError,
  SetRoomsUsers,
  SetUploadProgress,
  UploadFile
} from '@/types/types';
import {
  CurrentUserInfoModel,
  MessageModel,
  RoomDictModel,
  RoomModel,
  UserDictModel,
  UserModel
} from '@/types/model';
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
} from '@/types/messages';
import {MessageModelDto, RoomDto, UserDto} from '@/types/dto';
import {convertFiles, convertUser, getRoomsBaseDict} from '@/types/converters';
import WsHandler from '@/utils/WsHandler';
import NotifierHandler from '@/utils/NotificationHandler';
import {sub} from '@/utils/sub';
import {DefaultStore} from'@/utils/store';

export default class ChannelsHandler extends MessageHandler {
  protected readonly logger: Logger;
  private readonly store: DefaultStore;
  private readonly api: Api;
  private readonly ws: WsHandler;
  private readonly sendingMessage: {} = {};
  private readonly notifier: NotifierHandler;
  private messageBus: Vue;

  protected readonly handlers = {
    init: this.init,
    internetAppear: this.internetAppear,
    loadMessages: this.loadMessages,
    deleteMessage: this.deleteMessage,
    editMessage: this.editMessage,
    addOnlineUser: this.addOnlineUser,
    removeOnlineUser: this.removeOnlineUser,
    printMessage: this.printMessage,
    deleteRoom: this.deleteRoom,
    leaveUser: this.leaveUser,
    addRoom: this.addRoom,
    inviteUser: this.inviteUser,
    addInvite: this.addInvite,
  };

  constructor(store: DefaultStore, api: Api, ws: WsHandler, notifier: NotifierHandler, messageBus: Vue) {
    super();
    this.store = store;
    this.api = api;
    sub.subscribe('channels', this);
    sub.subscribe('lan', this);
    this.logger = loggerFactory.getLoggerColor('chat', '#940500');
    this.ws = ws;
    this.messageBus = messageBus;
    this.notifier = notifier;
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

  public removeAllSendingMessages() {
    let length = Object.keys(this.sendingMessage).length;
    for (let k in this.sendingMessage) {
      this.removeSendingMessage(k);
    }
    this.logger.log('Flushed {} sending messages', length);
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
      return [];
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
        this.store.setMessageProgressError(newVar);
        cb(null);
      } else {
        let newVar: RemoveMessageProgress = {
          messageId, roomId
        };
        this.store.removeMessageProgress(newVar);
        cb(res);
      }
    }, evt => {
      if (evt.lengthComputable) {
        let payload: SetMessageProgress = {
          messageId,
          roomId,
          uploaded: evt.loaded,
        };
        this.store.setMessageProgress(payload);
      }
    });
    let sup: SetUploadProgress = {
      upload: {
        total: size,
        uploaded: 0
      },
      messageId,
      roomId
    };
    this.store.setUploadProgress(sup);
  }


  public addMessages(roomId: number, inMessages: MessageModelDto[]) {
    let oldMessages: { [id: number]: MessageModel } = this.store.roomsDict[roomId].messages;
    let newMesages: MessageModelDto[] = inMessages.filter(i => !oldMessages[i.id]);
    let messages: MessageModel[] = newMesages.map(this.getMessage.bind(this));
    this.store.addMessages({messages, roomId: roomId});
  }
  public initUsers(users: UserDto[]) {
    this.logger.debug('set users {}', users)();
    let um: UserDictModel = {};
    users.forEach(u => {
      um[u.userId] = convertUser(u);
    });
    this.store.setUsers(um);
  }

  public initRooms(rooms: RoomDto[]) {
    this.logger.debug('Setting rooms')();
    let storeRooms: RoomDictModel = {};
    let roomsDict: RoomDictModel = this.store.roomsDict;
    rooms.forEach((newRoom: RoomDto) => {
      let oldRoom = roomsDict[newRoom.roomId];
      let rm: RoomModel = getRoomsBaseDict(newRoom, oldRoom);
      storeRooms[rm.id] = rm;
    });
    this.store.setRooms(storeRooms);
  }


  init(m: PubSetRooms) {
    this.store.setOnline([...m.online]);
    this.initUsers(m.users);
    this.initRooms(m.rooms);
  }
  private internetAppear() {
    for (let k in this.sendingMessage) {
      this.resendMessage(k);
    }
  }
  private loadMessages(lm: LoadMessages) {
    if (lm.content.length > 0) {
      this.addMessages(lm.roomId, lm.content);
    } else {
      this.store.setAllLoaded(lm.roomId);
    }
  }
  private deleteMessage(inMessage: DeleteMessage) {
    let message: MessageModel = this.store.roomsDict[inMessage.roomId].messages[inMessage.id];
    if (!message) {
      this.logger.debug('Unable to find message {} to delete it', inMessage)();
    } else {
      message = {
        id: message.id,
        time: message.time,
        files: message.files,
        content: message.content || null,
        symbol: message.symbol || null,
        edited: inMessage.edited,
        roomId: message.roomId,
        userId: message.userId,
        transfer: null,
        giphy: message.giphy || null,
        deleted: true
      };
      this.logger.debug('Adding message to storage {}', message)();
      this.store.addMessage(message);
      if (inMessage.cbBySender === this.ws.getWsConnectionId()) {
        let removed = this.removeSendingMessage(inMessage.messageId);
      }
    }
  }
  private editMessage(inMessage: EditMessage) {
    let message: MessageModel = this.store.roomsDict[inMessage.roomId].messages[inMessage.id];
    if (!message) {
      this.logger.debug('Unable to find message {} to edit it', inMessage)();
    } else {
      let message: MessageModel = this.getMessage(inMessage);
      this.logger.debug('Adding message to storage {}', message)();
      this.store.addMessage(message);
      if (inMessage.cbBySender === this.ws.getWsConnectionId()) {
        let removed = this.removeSendingMessage(inMessage.messageId);
      }
    }
  }
  private addOnlineUser(message: AddOnlineUserMessage) {
    if (!this.store.allUsersDict[message.userId]) {
      let newVar: UserModel = convertUser(message);
      this.store.addUser(newVar);
    }
    this.addChangeOnlineEntry(message.userId, message.time, true);
    this.store.setOnline([...message.content]);
  }
  private removeOnlineUser(message: RemoveOnlineUserMessage) {
    this.addChangeOnlineEntry(message.userId, message.time, false);
    this.store.setOnline(message.content);
  }
  private printMessage(inMessage: EditMessage) {
    if (inMessage.cbBySender === this.ws.getWsConnectionId()) {
      this.removeSendingMessage(inMessage.messageId);
      let rmMes: RemoveSendingMessage = {
        messageId: inMessage.messageId,
        roomId: inMessage.roomId
      };
      this.store.deleteMessage(rmMes);
    }
    let message: MessageModel = this.getMessage(inMessage);
    this.logger.debug('Adding message to storage {}', message)();
    this.store.addMessage(message);
    let activeRoom: RoomModel = this.store.activeRoom;
    let activeRoomId = activeRoom && activeRoom.id; // if no channels page first
    let room = this.store.roomsDict[inMessage.roomId];
    let userInfo: CurrentUserInfoModel = this.store.userInfo;
    let isSelf = inMessage.userId === userInfo.userId;
    if (activeRoomId !== inMessage.roomId && !isSelf) {
      this.store.incNewMessagesCount(inMessage.roomId);
    }
    if (room.notifications && !isSelf) {
      let title = this.store.allUsersDict[inMessage.userId].user;
      this.notifier.showNotification(title, {
        body: inMessage.content || 'Image',
        data: {
          replaced: 1,
          title,
          roomId: inMessage.roomId
        },
        requireInteraction: true,
        icon: inMessage.files || faviconUrl
      });
    }

    if (this.store.userSettings.messageSound) {
      if (message.userId === userInfo.userId) {
        checkAndPlay(outgoing, room.volume);
      } else {
        checkAndPlay(incoming, room.volume);
      }
    }

    this.messageBus.$emit('scroll');
  }
  private deleteRoom(message: DeleteRoomMessage) {
    if (this.store.roomsDict[message.roomId]) {
      this.store.deleteRoom(message.roomId);
    } else {
      this.logger.error('Unable to find room {} to delete', message.roomId)();
    }
  }
  private leaveUser(message: LeaveUserMessage) {
    if (this.store.roomsDict[message.roomId]) {
      let m: SetRoomsUsers = {
        roomId: message.roomId,
        users: message.users
      };
      this.store.setRoomsUsers(m);
    } else {
      this.logger.error('Unable to find room {} to kick user', message.roomId)();
    }
  }
  private addRoom(message: AddRoomMessage) {
    this.mutateRoomAddition(message);
  }
  private inviteUser(message: InviteUserMessage) {
    this.store.setRoomsUsers({roomId: message.roomId, users: message.users} as SetRoomsUsers);
  }
  private addInvite(message: AddInviteMessage) {
    this.mutateRoomAddition(message);
  }

  private  addChangeOnlineEntry(userId: number, time: number, isWentOnline: boolean) {
    let roomIds = [];
    this.store.roomsArray.forEach(r => {
      if (r.users.indexOf(userId)) {
        roomIds.push(r.id);
      }
    });
    let entry:  ChangeOnlineEntry = {
      roomIds,
      changeOnline: {
        isWentOnline,
        time,
        userId
      }
    };

    // TODO Uncaught TypeError: Cannot read property 'onlineChangeSound' of null
    if (this.store.userSettings.onlineChangeSound && this.store.myId !== userId) {
      checkAndPlay(isWentOnline ? login : logout, 50);
    }
    this.store.addChangeOnlineEntry(entry);
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


  private mutateRoomAddition(message: AddRoomBase) {
    let r: RoomModel = getRoomsBaseDict(message);
    this.store.addRoom(r);
  }


  protected getMethodHandlers() {
    return this.handlers;
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
      transfer: null,
      giphy: message.giphy || null,
      deleted: message.deleted || null
    };
  }




}
