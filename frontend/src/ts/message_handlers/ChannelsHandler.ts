import loggerFactory from '@/ts/instances/loggerFactory';
import Api from '@/ts/message_handlers/Api';
import Vue from 'vue';
import MessageHandler from '@/ts/message_handlers/MesageHandler';
import {
  HandlerType,
  HandlerTypes,
  MessageRetrierProxy,
  MessageSender,
  PubSetRooms,
  RemoveMessageProgress,
  RemoveSendingMessage,
  RoomLogEntry,
  SetMessageProgress,
  SetMessageProgressError,
  SetRoomsUsers,
  SetUploadProgress,
  UploadFile
} from '@/ts/types/types'
import {
  incoming,
  login,
  logout,
  outgoing
} from '@/ts/utils/audio';
import faviconUrl from '@/assets/img/favicon.ico';
import {
  ChannelModel,
  ChannelsDictModel,
  CurrentUserInfoModel,
  MessageModel,
  RoomDictModel,
  RoomModel,
  RoomSettingsModel,
  UserDictModel,
  UserModel
} from '@/ts/types/model';
import { Logger } from 'lines-logger';
import {
  AddChannelMessage,
  AddInviteMessage,
  AddOnlineUserMessage,
  AddRoomBase,
  AddRoomMessage,
  ChangeDevicesMessage,
  DeleteChannel,
  DeleteMessage,
  DeleteRoomMessage,
  EditMessage,
  InviteUserMessage,
  LeaveUserMessage,
  LoadMessages,
  LogoutMessage,
  RemoveOnlineUserMessage,
  SaveChannelSettings,
  SaveRoomSettings
} from '@/ts/types/messages';
import {
  ChannelDto,
  FileModelDto,
  MessageModelDto,
  RoomDto,
  SetStateFromWS
} from '@/ts/types/dto';
import {
  convertFiles,
  convertUser,
  getChannelDict,
  getRoom,
  getRoomsBaseDict
} from '@/ts/types/converters';
import WsHandler from '@/ts/message_handlers/WsHandler';
import NotifierHandler from '@/ts/classes/NotificationHandler';
import { sub } from '@/ts/instances/subInstance';
import { DefaultStore } from '@/ts/classes/DefaultStore';
import MessageRetrier from '@/ts/message_handlers/MessageRetrier';
import { AudioPlayer } from '@/ts/classes/AudioPlayer';

// TODO split this class into 2 separate:
// 1st one for message handling that's related to MessageSender and MessageTrasnferHandler (webrtc one)
// 2nd one that's responsible for user Online, room management and etc

export default class ChannelsHandler extends MessageHandler implements MessageRetrierProxy , MessageSender {
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
    deleteChannel: <HandlerType>this.deleteChannel,
    saveRoomSettings: <HandlerType>this.saveRoomSettings,
    logout: <HandlerType>this.logout
  };

  // messageRetrier uses MessageModel.id as unique identifier, do NOT use it with any types but
  // Send message, delete message, edit message, as it will have the sameId which could erase some callback
  private readonly messageRetrier: MessageRetrier;
  private readonly store: DefaultStore;
  private readonly api: Api;
  private readonly ws: WsHandler;
  private readonly notifier: NotifierHandler;
  private readonly messageBus:  Vue;
  private readonly audioPlayer: AudioPlayer;

  constructor(store: DefaultStore, api: Api, ws: WsHandler, notifier: NotifierHandler, messageBus: Vue, audioPlayer: AudioPlayer) {
    super();
    this.store = store;
    this.api = api;
    sub.subscribe('channels', this);
    sub.subscribe('lan', this);
    this.logger = loggerFactory.getLoggerColor('chat', '#940500');
    this.ws = ws;
    this.audioPlayer = audioPlayer;
    this.messageRetrier = new MessageRetrier();
    this.messageBus = messageBus;
    this.notifier = notifier;
  }

  getMessageRetrier(): MessageRetrier {
     return this.messageRetrier;
  }

  logout(m: LogoutMessage) {
    this.store.logout();
  }

  public sendDeleteMessage(id: number): void {
    this.messageRetrier.asyncExecuteAndPutInCallback(
        id,
        () => this.ws.sendEditMessage(null, id, null, id)
    );
  }

  public async uploadFilesOrRetry(
      id: number,
      roomId: number,
      uploadFiles: UploadFile[],
      retry: () => Promise<void>
  ): Promise<number[]> {
    let fileIds: number[] = [];
    if (uploadFiles.length) {
      try {
        fileIds =  await this.uploadFiles(id, roomId, uploadFiles);
      } catch (e) {
        this.logger.error('Uploading error, scheduling cb')();
        this.messageRetrier.putCallBack(id, retry);
        throw e;
      }
    }
    return fileIds;
  }

  public async sendEditMessage(content: string, roomId: number, id: number, uploadFiles: UploadFile[]): Promise<void> {
    const fileIds: number[] = await this.uploadFilesOrRetry(
        id,
        roomId,
        uploadFiles,
        () => this.sendEditMessage(content, roomId, id, uploadFiles)
    );
    this.messageRetrier.asyncExecuteAndPutInCallback(id, () => this.ws.sendEditMessage(content, id, fileIds, id));
  }

  public async sendSendMessage(
      content: string,
      roomId: number,
      uploadFiles: UploadFile[],
      cbId: number,
      originTime: number
  ):  Promise<void> {
    const fileIds: number[] = await this.uploadFilesOrRetry(
      cbId,
      roomId,
      uploadFiles,
      () => this.sendSendMessage(content, roomId, uploadFiles, cbId, originTime)
    );
    this.messageRetrier.asyncExecuteAndPutInCallback(
      cbId,
      () => this.ws.sendSendMessage(content, roomId, fileIds, cbId, Date.now() - originTime)
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

    const {rooms, channels, users, online} = m;
    // otherwise, we will modify value from ws, which will make observable in logs
    // other values from 'm' are converted with convertable
    let ids: PubSetRooms['online'] = JSON.parse(JSON.stringify(online));
    this.store.setOnline(ids);

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
    this.messageRetrier.resendAllMessages();
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
        isHighlighted: false,
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
        const removed = this.messageRetrier.removeSendingMessage(inMessage.messageId);
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
        this.messageRetrier.removeSendingMessage(inMessage.messageId);
      }
    }
  }

  private addOnlineUser(message: AddOnlineUserMessage) {
    if (!this.store.allUsersDict[message.userId]) {
      const newVar: UserModel = convertUser(message);
      this.store.addUser(newVar);
    }
    if (message.content[message.userId].length === 1) {
      // exactly 1 device is now offline, so that new that appeared is the first one
      this.addChangeOnlineEntry(message.userId, message.time, 'appeared online');
    }
    this.store.setOnline(message.content);
    this.notifyDevicesChanged(message.userId, null);

  }

  private notifyDevicesChanged(userId: number|null, roomId: number|null) {
    let message: ChangeDevicesMessage = {
      handler: 'message',
      action: 'changeDevices',
      allowZeroSubscribers: true,
      roomId,
      userId
    };
    sub.notify(message);
  }

  private removeOnlineUser(message: RemoveOnlineUserMessage) {
    if (message.content[message.userId].length === 0) {
      this.addChangeOnlineEntry(message.userId, message.time, 'gone offline');
    }
    this.store.setOnline(message.content);
    this.notifyDevicesChanged(message.userId, null);
  }

  private printMessage(inMessage: EditMessage) {
    if (inMessage.cbBySender === this.ws.getWsConnectionId()) {
      this.messageRetrier.removeSendingMessage(inMessage.messageId);
      if (!inMessage.messageId) {
        throw Error(`Unknown messageId ${inMessage}`);
      }
      const rmMes: RemoveSendingMessage = {
        messageId: inMessage.messageId,
        roomId: inMessage.roomId
      };
      this.store.deleteMessage(rmMes);
    }
    const message: MessageModel = this.getMessage(inMessage);
    this.logger.debug('Adding message to storage {}', message)();
    const activeRoom: RoomModel | null = this.store.activeRoom;
    const activeRoomId = activeRoom && activeRoom.id; // if no channels page first
    const room = this.store.roomsDict[inMessage.roomId];
    const userInfo: CurrentUserInfoModel = this.store.userInfo!;
    const isSelf = inMessage.userId === userInfo.userId;
    if (!isSelf && (!this.notifier.getIsCurrentWindowActive() || activeRoomId !== inMessage.roomId)) {
      message.isHighlighted = true;
    }
    this.store.addMessage(message);
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
        this.audioPlayer.checkAndPlay(outgoing, room.volume);
      } else {
        this.audioPlayer.checkAndPlay(incoming, room.volume);
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
    this.notifyDevicesChanged(null, message.roomId);
  }

  private leaveUser(message: LeaveUserMessage) {
    if (this.store.roomsDict[message.roomId]) {
      const m: SetRoomsUsers = {
        roomId: message.roomId,
        users: message.users
      };
      this.store.setRoomsUsers(m);
      this.store.addRoomLog({
        roomLog: {
          userId: message.userId,
          time: Date.now(), // TODO
          action: 'left this room'
        },
        roomIds: [message.roomId]
      });
      this.notifyDevicesChanged(null, message.roomId);
    } else {
      this.logger.error('Unable to find room {} to kick user', message.roomId)();
    }
  }

  private addRoom(message: AddRoomMessage) {
    this.mutateRoomAddition(message);
    if (message.channelId) {
      let channelDict: ChannelModel = getChannelDict(message as  Omit<AddRoomMessage, 'channelId'> & { channelId: number; });
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

  private saveRoomSettings(message: SaveRoomSettings) {
    if (!this.store.roomsDict[message.roomId]) {
      this.logger.error('Unable to find channel to edit {} to kick user, available are {}', message.roomId, Object.keys(this.store.roomsDict))();
    } else {
      const r: RoomSettingsModel = getRoom(message);
      this.store.setRoomSettings(r);
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
    message.inviteeUserId.forEach(i => {
      this.store.addRoomLog({roomIds: [message.roomId], roomLog: {
        action: 'joined this room',
        time: message.time,
        userId: i
      }});
    })
    this.notifyDevicesChanged(null, message.roomId);
  }

  private deleteChannel(message: DeleteChannel) {
    this.store.deleteChannel(message.channelId);
  }

  private addInvite(message: AddInviteMessage) {
    this.mutateRoomAddition(message);
  }

  private addChangeOnlineEntry(userId: number, time: number, action: 'appeared online' | 'gone offline') {
    const roomIds: number[] = [];
    this.store.roomsArray.forEach(r => {
      if (r.users.indexOf(userId)) {
        roomIds.push(r.id);
      }
    });
    const entry: RoomLogEntry = {
      roomIds,
      roomLog: {
        action,
        time,
        userId
      }
    };

    // TODO Uncaught TypeError: Cannot read property 'onlineChangeSound' of null
    if (this.store.userSettings!.onlineChangeSound && this.store.myId !== userId) {
      this.audioPlayer.checkAndPlay(action === 'appeared online' ? login : logout, 50);
    }
    this.store.addRoomLog(entry);
  }

  private mutateRoomAddition(message: AddRoomBase) {
    const r: RoomModel = getRoomsBaseDict(message);
    this.store.addRoom(r);
    this.store.addRoomLog({
      roomIds: [r.id],
      roomLog: {
        action: 'been invited to this room',
        time: message.time,
        userId: this.store.myId!
      }
    });
    this.notifyDevicesChanged(null, r.id) // TODO messageTransferhandler should be created or should id?
  }

  private getMessage(message: MessageModelDto): MessageModel {
    return {
      id: message.id,
      time: message.time,
      isHighlighted: false,
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
