import loggerFactory from '@/ts/instances/loggerFactory';
import Api from '@/ts/message_handlers/Api';
import Vue from 'vue';
import MessageHandler from '@/ts/message_handlers/MesageHandler';
import {
  MessageSender,
  RemoveMessageProgress,
  RoomMessageIds,
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
  FileModel,
  MessageModel,
  RoomDictModel,
  RoomModel,
  RoomSettingsModel,
  UserDictModel,
  UserModel
} from '@/ts/types/model';
import { Logger } from 'lines-logger';

import {
  ChannelDto,
  FileModelDto,
  MessageModelDto,
  RoomDto,
  SaveFileResponse,
  SetStateFromWS
} from '@/ts/types/dto';
import {
  convertUser,
  getChannelDict,
  getRoom,
  getRoomsBaseDict
} from '@/ts/types/converters';
import WsHandler from '@/ts/message_handlers/WsHandler';
import NotifierHandler from '@/ts/classes/NotificationHandler';
import { sub } from '@/ts/instances/subInstance';
import { DefaultStore } from '@/ts/classes/DefaultStore';
import { AudioPlayer } from '@/ts/classes/AudioPlayer';
import {
  ChangeDevicesMessage,
  LogoutMessage,
  PubSetRooms
} from '@/ts/types/messages/innerMessages';
import {
  AddRoomBase,
  HandlerType,
  HandlerTypes
} from '@/ts/types/messages/baseMessagesInterfaces';
import {
  AddChannelMessage,
  AddInviteMessage,
  AddOnlineUserMessage,
  AddRoomMessage,
  DeleteChannelMessage,
  DeleteMessage,
  DeleteRoomMessage,
  EditMessage,
  InviteUserMessage,
  LeaveUserMessage,
  LoadMessages,
  PrintMessage,
  RemoveOnlineUserMessage,
  SaveChannelSettingsMessage,
  SaveRoomSettingsMessage
} from '@/ts/types/messages/wsInMessages';
import { savedFiles } from '@/ts/utils/htmlApi';
import { MessageHelper } from '@/ts/message_handlers/MessageHelper';

// TODO split this class into 2 separate:
// 1st one for message handling that's related to MessageSender and MessageTrasnferHandler (webrtc one)
// 2nd one that's responsible for user Online, room management and etc

export default class ChannelsHandler extends MessageHandler implements  MessageSender {

  protected readonly logger: Logger;

  protected readonly handlers: HandlerTypes<keyof ChannelsHandler, 'channels'> = {
    init:  <HandlerType<'init', 'channels'>>this.init,
    internetAppear:  <HandlerType<'internetAppear', 'channels'>>this.internetAppear,
    loadMessages:  <HandlerType<'loadMessages', 'channels'>>this.loadMessages,
    deleteMessage:  <HandlerType<'deleteMessage', 'channels'>>this.deleteMessage,
    editMessage:  <HandlerType<'editMessage', 'channels'>>this.editMessage,
    addOnlineUser:  <HandlerType<'addOnlineUser', 'channels'>>this.addOnlineUser,
    removeOnlineUser:  <HandlerType<'removeOnlineUser', 'channels'>>this.removeOnlineUser,
    printMessage:  <HandlerType<'printMessage', 'channels'>>this.printMessage,
    deleteRoom:  <HandlerType<'deleteRoom', 'channels'>>this.deleteRoom,
    leaveUser:  <HandlerType<'leaveUser', 'channels'>>this.leaveUser,
    addRoom:  <HandlerType<'addRoom', 'channels'>>this.addRoom,
    addChannel:  <HandlerType<'addChannel', 'channels'>>this.addChannel,
    inviteUser:  <HandlerType<'inviteUser', 'channels'>>this.inviteUser,
    addInvite:  <HandlerType<'addInvite', 'channels'>>this.addInvite,
    saveChannelSettings:  <HandlerType<'saveChannelSettings', 'channels'>>this.saveChannelSettings,
    deleteChannel:  <HandlerType<'deleteChannel', 'channels'>>this.deleteChannel,
    saveRoomSettings:  <HandlerType<'saveRoomSettings', 'channels'>>this.saveRoomSettings,
    logout:  <HandlerType<'logout', 'channels'>>this.logout
  };

  // messageRetrier uses MessageModel.id as unique identifier, do NOT use it with any types but
  // Send message, delete message, edit message, as it will have the sameId which could erase some callback
  private readonly store: DefaultStore;
  private readonly api: Api;
  private readonly ws: WsHandler;
  private readonly audioPlayer: AudioPlayer;
  private syncMessageLock: boolean = false;
  private readonly messageHelper: MessageHelper;

  constructor(
      store: DefaultStore,
      api: Api,
      ws: WsHandler,
      audioPlayer: AudioPlayer,
      messageHelper: MessageHelper,
  ) {
    super();
    this.store = store;
    this.api = api;
    sub.subscribe('channels', this);
    sub.subscribe('lan', this);
    this.logger = loggerFactory.getLoggerColor('chat', '#940500');
    this.ws = ws;
    this.audioPlayer = audioPlayer;
    this.messageHelper = messageHelper;
  }

  logout(m: LogoutMessage) {
    this.store.logout();
  }

  public async syncMessages() {
    if (this.syncMessageLock) {
      this.logger.warn('Exiting from sync message because, the lock is already acquired')();
      return;
    }
    try {
      this.syncMessageLock = true;
      for (const room of this.store.roomsArray) {
        if (room.p2p) {
          continue;
        }
        for (const message of  Object.values(room.messages)) {
          if (message.sending) {
              await this.syncMessage(room.id, message.id);
          }
        }
      }
    } catch (e) {
      this.logger.error('Can\'t send messages because {}', e)();
    } finally {
      this.syncMessageLock = false;
    }
  }

  public async syncMessage(roomId: number, messageId: number): Promise<void> {
    let storeMessage = this.store.roomsDict[roomId].messages[messageId];
    if (!storeMessage.content && storeMessage.id < 0) {
      // should not be here;
      throw Error("why we are here?");
    }
    await this.uploadFilesForMessages(storeMessage);
    storeMessage = this.store.roomsDict[roomId].messages[messageId];
    let fileIds: number[] = this.getFileIdsFromMessage(storeMessage);
    if (storeMessage.id < 0 && storeMessage.content) {
      await this.ws.sendPrintMessage(storeMessage.content, roomId, fileIds, storeMessage.id, Date.now() - storeMessage.time);
      const rmMes: RoomMessageIds = {
        messageId: storeMessage.id,
        roomId: storeMessage.roomId
      };
      this.store.deleteMessage(rmMes);
    } else if (storeMessage.id > 0) {
      this.ws.sendEditMessage(storeMessage.content, storeMessage.id, fileIds);
    } else if (!storeMessage.content && storeMessage.id < 0) {
      throw Error("Should not be here"); // this messages should be removed
    }
  }

  public async uploadFiles(
      messageId: number,
      roomId: number,
      files: UploadFile[]
  ): Promise<SaveFileResponse> {
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
      const res: SaveFileResponse = await this.api.uploadFiles(files, evt => {
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
      if (!res || Object.keys(res).length  === 0) {
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

  public internetAppear() {
    console.error("INTERNETAPPEAR")
    // debugger
    // this.messageRetrier.resendAllMessages(); TODO
  }

  public loadMessages(lm: LoadMessages) {
    if (lm.content.length > 0) {
      this.addMessages(lm.roomId, lm.content);
    } else {
      this.store.setAllLoaded(lm.roomId);
    }
  }

  public deleteMessage(inMessage: DeleteMessage) {
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
        sending: false,
        edited: inMessage.edited,
        roomId: message.roomId,
        userId: message.userId,
        transfer: null,
        giphy: message.giphy || null,
        deleted: true
      };
      this.logger.debug('Adding message to storage {}', message)();
      this.store.addMessage(message);
    }
  }

  public editMessage(inMessage: EditMessage) {
    const message: MessageModel = this.store.roomsDict[inMessage.roomId].messages[inMessage.id];
    if (!message) {
      this.logger.debug('Unable to find message {} to edit it', inMessage)();
    } else {
      const message: MessageModel = this.getMessage(inMessage);
      this.logger.debug('Adding message to storage {}', message)();
      this.store.addMessage(message);
    }
  }

  public addOnlineUser(message: AddOnlineUserMessage) {
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
    console.error("TODO")
    // sub.notify(message);
  }

  public removeOnlineUser(message: RemoveOnlineUserMessage) {
    if (message.content[message.userId].length === 0) {
      this.addChangeOnlineEntry(message.userId, message.time, 'gone offline');
    }
    this.store.setOnline(message.content);
    this.notifyDevicesChanged(message.userId, null);
  }

  public printMessage(inMessage: PrintMessage) {
    const message: MessageModel = this.getMessage(inMessage);
    this.messageHelper.processUnkownP2pMessage(message);

  }

  public deleteRoom(message: DeleteRoomMessage) {
    if (this.store.roomsDict[message.roomId]) {
      this.store.deleteRoom(message.roomId);
    } else {
      this.logger.error('Unable to find room {} to delete', message.roomId)();
    }
    this.notifyDevicesChanged(null, message.roomId);
  }

  public leaveUser(message: LeaveUserMessage) {
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

  public addRoom(message: AddRoomMessage) {
    this.mutateRoomAddition(message);
    if (message.channelId) {
      let channelDict: ChannelModel = getChannelDict(message as  Omit<AddRoomMessage, 'channelId'> & { channelId: number; });
      this.store.addChannel(channelDict);
    }
  }

  public saveChannelSettings(message: SaveChannelSettingsMessage) {
    if (!this.store.channelsDict[message.channelId]) {
      this.logger.error('Unable to find channel to edit {} to kick user, available are {}', message.channelId, Object.keys(this.store.channelsDict))();
    } else {
      const c: ChannelModel = getChannelDict(message);
      this.store.addChannel(c);
    }
  }

  public saveRoomSettings(message: SaveRoomSettingsMessage) {
    if (!this.store.roomsDict[message.roomId]) {
      this.logger.error('Unable to find channel to edit {} to kick user, available are {}', message.roomId, Object.keys(this.store.roomsDict))();
    } else {
      const r: RoomSettingsModel = getRoom(message);
      this.store.setRoomSettings(r);
    }
  }

  public addChannel(message: AddChannelMessage) {
    let channelDict: ChannelModel = getChannelDict(message);
    this.store.addChannel(channelDict);
  }

  public inviteUser(message: InviteUserMessage) {
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

  public deleteChannel(message: DeleteChannelMessage) {
    this.store.deleteChannel(message.channelId);
  }

  public addInvite(message: AddInviteMessage) {
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


  private getFileIdsFromMessage(storeMessage: MessageModel): number[] {
    let files: number[] = []
    if (storeMessage.files) {
      let fileValues = Object.values(storeMessage.files);
      if (fileValues.find(f => !f.fileId && f.sending)) {
        throw Error('New files were added during upload') // TODO
      }
      fileValues.forEach(fv => {
        files.push(fv.fileId!)
        if (fv.previewFileId) {
          files.push(fv.previewFileId)
        }
      });
    }
    return files;
  }

  private async uploadFilesForMessages(storeMessage: MessageModel) {
    if (storeMessage.files) {
      let uploadFiles: UploadFile[] = [];
      Object.keys(storeMessage.files)
          .filter(k => !storeMessage.files![k].fileId && storeMessage.files![k].sending)
          .forEach(k => {
            let file: FileModel = storeMessage.files![k];
            uploadFiles.push({
              file: savedFiles[file.url!], // TODO why null?
              key: file.type + k
            });
            if (file.preview) {
              uploadFiles.push({
                file: savedFiles[file.preview],
                key: `p${k}`
              });
            }
          });
      if (uploadFiles.length > 0) {
        let fileIds = await this.uploadFiles(storeMessage.id, storeMessage.roomId, uploadFiles);
        this.store.setMessageFileIds({roomId: storeMessage.roomId, messageId: storeMessage.id, fileIds});
      }
    }
  }

  private getMessage(message: MessageModelDto): MessageModel {
    function convertFiles(dtos: {[id: number]: FileModelDto}): {[id: number]: FileModel} {
      const res: {[id: number]: FileModel} = {};
      for (const k in dtos) {
        let dto = dtos[k];
        res[k] = {
          fileId: null,
          sending: false,
          previewFileId: null,
          preview: dto.preview,
          type: dto.type,
          url: dto.url
        }
      }
      return res;
    }

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
      sending: false, // this code is only called from WsInMessagew which means it's synced
      giphy: message.giphy || null,
      deleted: message.deleted || false
    };
  }

}
