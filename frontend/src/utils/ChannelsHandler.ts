import loggerFactory from '@/utils/loggerFactory';
import Api from '@/utils/api';
import Vue from 'vue';
import MessageHandler, {HandlerType, HandlerTypes} from '@/utils/MesageHandler';
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
  ChannelModel,
  ChannelsDictModel,
  CurrentUserInfoModel,
  MessageModel,
  RoomDictModel,
  RoomModel,
  UserDictModel,
  UserModel
} from '@/types/model';
import {Logger} from 'lines-logger';
import {
  AddChannelMessage,
  AddInviteMessage,
  AddOnlineUserMessage,
  AddRoomBase,
  AddRoomMessage,
  DefaultMessage,
  DeleteChannel,
  DeleteMessage,
  DeleteRoomMessage,
  EditMessage,
  InviteUserMessage,
  LeaveUserMessage,
  LoadMessages,
  RemoveOnlineUserMessage, SaveChannelSettings
} from '@/types/messages';
import {
  ChannelDto,
  FileModelDto,
  MessageModelDto,
  RoomDto,
  SetStateFromWS,
  UserDto
} from '@/types/dto';
import {
  convertFiles,
  convertUser,
  getChannelDict,
  getRoomsBaseDict
} from '@/types/converters';
import WsHandler from '@/utils/WsHandler';
import NotifierHandler from '@/utils/NotificationHandler';
import {sub} from '@/utils/sub';
import {DefaultStore} from '@/utils/store';

export default class ChannelsHandler extends MessageHandler {
  protected readonly logger: Logger;

  protected readonly handlers: HandlerTypes = {
    init: <HandlerType>this.init,
    internetAppear: <HandlerType>this.internetAppear,
    loadMessages: <HandlerType>this.loadMessages,
    deleteMessage: <HandlerType>this.deleteMessage,
    editMessage: <HandlerType>this.editMessage,
    addOnlineUser: <HandlerType>this.addOnlineUser,
    removeOnlineUser: <HandlerType>this.removeOnlineUser,
    printMessage: <HandlerType>this.printMessage,
    deleteRoom: <HandlerType>this.deleteRoom,
    leaveUser: <HandlerType>this.leaveUser,
    addRoom: <HandlerType>this.addRoom,
    addChannel: <HandlerType>this.addChannel,
    inviteUser: <HandlerType>this.inviteUser,
    addInvite: <HandlerType>this.addInvite,
    saveChannelSettings: <HandlerType>this.saveChannelSettings,
    deleteChannel: <HandlerType>this.deleteChannel
  };
  private readonly store: DefaultStore;
  private readonly api: Api;
  private readonly ws: WsHandler;
  private readonly sendingMessage: { [id: number]: { cb(): void; files: UploadFile[] }; cb?(ids: number[]): void } = {};
  private readonly notifier: NotifierHandler;
  private readonly messageBus:  Vue;

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

  public removeSendingMessage(messageId: number | undefined) {
    if (messageId && this.sendingMessage[messageId]) {
      delete this.sendingMessage[messageId];

      return true;
    } else if (!messageId) {
      this.logger.warn('Got unknown message {}', messageId)();

      return false;
    } else {
      throw Error(`Unknown message ${messageId}`);
    }
  }

  public removeAllSendingMessages() {
    const length = Object.keys(this.sendingMessage).length;
    for (const k in this.sendingMessage) {
      this.removeSendingMessage(parseInt(k));
    }
    this.logger.log('Flushed {} sending messages', length);
  }

  public resendMessage(id: number) {
    this.logger.log('resending message {} ', id)();
    const cb = this.sendingMessage[id].cb;
    cb();
  }

  public getMessageFiles(messageId: number): UploadFile[] {
    if (this.sendingMessage[messageId]) {
      return this.sendingMessage[messageId].files;
    } else {
      return [];
    }
  }

  public sendDeleteMessage(id: number, originId: number): void {
    this.sendingMessage[originId] = {
      cb: () => this.ws.sendEditMessage(null, id, null, originId),
      files: []
    };
    this.sendingMessage[originId].cb();
  }

  public sendEditMessage(content: string, roomId: number, id: number, uploadfiles: UploadFile[]): void {
    this.uploadAndSend(id, (filesIds: number[]) => {
      return () => this.ws.sendEditMessage(content, id, filesIds, id); // TODO
    },                 () => {
      this.sendEditMessage(content, roomId, id, uploadfiles);
    },                 uploadfiles, roomId);
  }

  public sendSendMessage(
      content: string,
      roomId: number,
      uploadfiles: UploadFile[],
      originId: number,
      originTime: number
  ): void {
    this.uploadAndSend(
        originId,
        (filesIds) => {
          return () => this.ws.sendSendMessage(content, roomId, filesIds, originId, Date.now() - originTime);
        }, () => {
          this.sendSendMessage(content, roomId, uploadfiles, originId, originTime);
        },
        uploadfiles,
        roomId
    );
  }

  public async uploadFiles(
      messageId: number,
      roomId: number,
      files: UploadFile[]
  ): Promise<number[]> {
    let size: number = 0;
    files.forEach(f => size += f.file.size);
    const sup: SetUploadProgress = {
      upload: {
        total: size,
        uploaded: 0
      },
      messageId,
      roomId
    };
    this.store.setUploadProgress(sup);
    try {
      const res: number[] = await this.api.uploadFiles(files, evt => {
        if (evt.lengthComputable) {
          const payload: SetMessageProgress = {
            messageId,
            roomId,
            uploaded: evt.loaded
          };
          this.store.setMessageProgress(payload);
        }
      });
      const newVar: RemoveMessageProgress = {
        messageId, roomId
      };
      this.store.removeMessageProgress(newVar);
      if (!res || !res.length) {
        throw Error('Missing files uploads');
      }

      return res;
    } catch (error) {
      const newVar: SetMessageProgressError = {
        messageId,
        roomId,
        error
      };
      this.store.setMessageProgressError(newVar);
      throw error;
    }

  }

  public addMessages(roomId: number, inMessages: MessageModelDto[]) {
    const oldMessages: { [id: number]: MessageModel } = this.store.roomsDict[roomId].messages;
    const newMesages: MessageModelDto[] = inMessages.filter(i => !oldMessages[i.id]);
    const messages: MessageModel[] = newMesages.map(this.getMessage.bind(this));
    this.store.addMessages({messages, roomId: roomId});
  }



  public init(m: PubSetRooms) {

    const {rooms, channels, users} = m;
    this.store.setOnline([...m.online]);

    this.logger.debug('set users {}', users)();
    const um: UserDictModel = {};
    users.forEach(u => {
      um[u.userId] = convertUser(u);
    });

    this.logger.debug('Setting rooms')();
    const storeRooms: RoomDictModel = {};
    const roomsDict: RoomDictModel = this.store.roomsDict;
    rooms.forEach((newRoom: RoomDto) => {
      const oldRoom = roomsDict[newRoom.roomId];
      const rm: RoomModel = getRoomsBaseDict(newRoom, oldRoom);
      storeRooms[rm.id] = rm;
    });

    this.logger.debug('Setting channels')();
    const channelsDict: ChannelsDictModel = this.store.channelsDict;
    const storeChannel: ChannelsDictModel = channels.reduce((dict: ChannelsDictModel, newChannel: ChannelDto) => {
      const oldChannel = channelsDict[newChannel.channelId];
      const cm: ChannelModel = getChannelDict(newChannel, oldChannel);
      dict[cm.id] = cm;
      return dict;
    }, {});

    const newState: SetStateFromWS = {
      allUsersDict: um,
      channelsDict: storeChannel,
      roomsDict: storeRooms
    };

    this.store.setStateFromWS(newState);
  }

  protected getMethodHandlers() {
    return this.handlers;
  }

  private internetAppear() {
    for (const k in this.sendingMessage) {
      this.resendMessage(parseInt(k));
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
        const removed = this.removeSendingMessage(inMessage.messageId);
      }
    }
  }

  private editMessage(inMessage: EditMessage) {
    const message: MessageModel = this.store.roomsDict[inMessage.roomId].messages[inMessage.id];
    if (!message) {
      this.logger.debug('Unable to find message {} to edit it', inMessage)();
    } else {
      const message: MessageModel = this.getMessage(inMessage);
      this.logger.debug('Adding message to storage {}', message)();
      this.store.addMessage(message);
      if (inMessage.cbBySender === this.ws.getWsConnectionId()) {
        const removed = this.removeSendingMessage(inMessage.messageId);
      }
    }
  }

  private addOnlineUser(message: AddOnlineUserMessage) {
    if (!this.store.allUsersDict[message.userId]) {
      const newVar: UserModel = convertUser(message);
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
      if (!inMessage.messageId) {
        throw Error(`Unkown messageId ${inMessage}`);
      }
      const rmMes: RemoveSendingMessage = {
        messageId: inMessage.messageId,
        roomId: inMessage.roomId
      };
      this.store.deleteMessage(rmMes);
    }
    const message: MessageModel = this.getMessage(inMessage);
    this.logger.debug('Adding message to storage {}', message)();
    this.store.addMessage(message);
    const activeRoom: RoomModel | null = this.store.activeRoom;
    const activeRoomId = activeRoom && activeRoom.id; // if no channels page first
    const room = this.store.roomsDict[inMessage.roomId];
    const userInfo: CurrentUserInfoModel = this.store.userInfo!;
    const isSelf = inMessage.userId === userInfo.userId;
    if (activeRoomId !== inMessage.roomId && !isSelf) {
      this.store.incNewMessagesCount(inMessage.roomId);
    }
    if (room.notifications && !isSelf) {
      const title = this.store.allUsersDict[inMessage.userId].user;

      let icon: string = <string>faviconUrl;
      if (inMessage.files) {
        const fff: FileModelDto = Object.values(inMessage.files)[0];
        if (fff.url) {
          icon = fff.url;
        }
      }
      this.notifier.showNotification(title, {
        body: inMessage.content || 'Image',
        replaced: 1,
        data: {
          replaced: 1,
          title,
          roomId: inMessage.roomId
        },
        requireInteraction: true,
        icon
      });
    }

    if (this.store.userSettings!.messageSound) {
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
      const m: SetRoomsUsers = {
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
    if (message.channelId) {
      let channelDict: ChannelModel = getChannelDict(message);
      this.store.addChannel(channelDict);
    }
  }

  private saveChannelSettings(message: SaveChannelSettings) {
    if (!this.store.channelsDict[message.channelId]) {
      this.logger.error('Unable to find channel to edit {} to kick user, available are {}', message.channelId, Object.keys(this.store.channelsDict))();
    } else {
      const c: ChannelModel = getChannelDict(message);
      this.store.addChannel(c);
    }
  }

  private addChannel(message: AddChannelMessage) {
    let channelDict: ChannelModel = getChannelDict(message);
    this.store.addChannel(channelDict);
  }

  private inviteUser(message: InviteUserMessage) {
    this.store.setRoomsUsers({
      roomId: message.roomId,
      users: message.users
    } as SetRoomsUsers);
  }

  private deleteChannel(message: DeleteChannel) {
    this.store.deleteChannel(message.channelId);
  }

  private addInvite(message: AddInviteMessage) {
    this.mutateRoomAddition(message);
  }

  private addChangeOnlineEntry(userId: number, time: number, isWentOnline: boolean) {
    const roomIds: number[] = [];
    this.store.roomsArray.forEach(r => {
      if (r.users.indexOf(userId)) {
        roomIds.push(r.id);
      }
    });
    const entry: ChangeOnlineEntry = {
      roomIds,
      changeOnline: {
        isWentOnline,
        time,
        userId
      }
    };

    // TODO Uncaught TypeError: Cannot read property 'onlineChangeSound' of null
    if (this.store.userSettings!.onlineChangeSound && this.store.myId !== userId) {
      checkAndPlay(isWentOnline ? login : logout, 50);
    }
    this.store.addChangeOnlineEntry(entry);
  }

  private async uploadAndSend(
      originId: number,
      getSendFilesToWsCB: (args: number[]) => () => void,
      repeatWithoutFiles: () => void,
      uploadFiles: UploadFile[],
      roomId: number
  ): Promise<void> {
    let fileIds: number[] = [];
    if (uploadFiles.length) {
      try {
        fileIds = await this.uploadFiles(originId, roomId, uploadFiles);
      } catch (e) {
        this.logger.error('Uploading error, scheduling cb')();
        this.sendingMessage[originId] = {
          cb: repeatWithoutFiles, // TODO
          files: uploadFiles
        };
        throw e;
      }
    }
    this.sendingMessage[originId] = {
      cb: getSendFilesToWsCB(fileIds),
      files: uploadFiles
    };
    this.sendingMessage[originId].cb();

  }

  private mutateRoomAddition(message: AddRoomBase) {
    const r: RoomModel = getRoomsBaseDict(message);
    this.store.addRoom(r);
  }

  private getMessage(message: MessageModelDto): MessageModel {
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
      deleted: message.deleted || false
    };
  }

}
