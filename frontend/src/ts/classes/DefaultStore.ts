import Vue from 'vue';
import Vuex from 'vuex';

import loggerFactory from '@/ts/instances/loggerFactory';
import {
  ChannelModel,
  ChannelsDictModel,
  ChannelsDictUIModel,
  ChannelUIModel,
  CurrentUserInfoModel,
  CurrentUserSettingsModel,
  EditingMessage,
  GrowlModel,
  GrowlType,
  IncomingCallModel,
  MessageModel,
  ReceivingFile,
  RoomDictModel,
  RoomModel,
  RoomSettingsModel,
  SendingFile,
  SendingFileTransfer,
  UserDictModel,
  UserModel
} from '@/ts/types/model';
import {
  AddSendingFileTransfer,
  BooleanIdentifier,
  IStorage,
  MarkMessageAsRead,
  MediaIdentifier,
  MessagesLocation,
  NumberIdentifier,
  PrivateRoomsIds,
  RemoveMessageProgress,
  RemoveSendingMessage,
  RoomLogEntry,
  SetCallOpponent,
  SetDevices,
  SetFileIdsForMessage,
  SetMessageProgress,
  SetMessageProgressError,
  SetOpponentAnchor,
  SetOpponentVoice,
  SetReceivingFileStatus,
  SetReceivingFileUploaded,
  SetRoomsUsers,
  SetSearchTo,
  SetSendingFileStatus,
  SetSendingFileUploaded,
  SetUploadProgress,
  StringIdentifier
} from '@/ts/types/types';
import {
  SetStateFromStorage,
  SetStateFromWS
} from '@/ts/types/dto';
import { encodeHTML } from '@/ts/utils/htmlApi';
import { ALL_ROOM_ID } from '@/ts/utils/consts';
import {
  Action,
  Module,
  Mutation,
  VuexModule
} from 'vuex-module-decorators';

const logger = loggerFactory.getLoggerColor('store', '#6a6400');

Vue.use(Vuex);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const mediaLinkIdGetter: Function = (function () {
  let i = 0;

  return function () {
    return String(i++);
  };
})();

const vueStore = new Vuex.Store({
  state: {},
  mutations: {},
  actions: {}
});

function Validate(target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function (...args: unknown[]) {
    try {
      original.apply(this, args);
    } catch (e) {
      throw Error(`store.${propertyKey}(${JSON.stringify(args)})\n\n ${JSON.stringify(this)}\n`);
    }
  };
}

@Module({
  dynamic: true,
  namespaced: true,
  name: 'default',
  store: vueStore
})
export class DefaultStore extends VuexModule {

  public storage!: IStorage; // We proxy this as soon as we created Storage
  public isOnline: boolean = false;
  public growls: GrowlModel[] = [];
  public dim: boolean = false;
  public pastingImagesQueue: string[] = [];
  public incomingCall: IncomingCallModel | null = null;
  public microphones: { [id: string]: string } = {};
  public speakers: { [id: string]: string } = {};
  public webcams: { [id: string]: string } = {};
  public editedMessage: EditingMessage | null = null;
  public activeRoomId: number | null = null;
  public activeUserId: number | null = null;
  public userInfo: CurrentUserInfoModel | null = null;
  public userSettings: CurrentUserSettingsModel | null = null;
  public userImage: string | null = null;
  public allUsersDict: UserDictModel = {};
  public regHeader: string | null = null;
  public onlineDict: Record<string, string[]> = {};
  public roomsDict: RoomDictModel = {};
  public showSmileys: boolean = false;
  public channelsDict: ChannelsDictModel = {};
  public mediaObjects: { [id: string]: MediaStream } = {};

  get userName(): (id: number) => string {
    return (id: number): string => this.allUsersDict[id].user;
  }

  get privateRooms(): RoomModel[] {
    const roomModels: RoomModel[] = this.roomsArray.filter(r => !r.name && !r.channelId);
    logger.debug('privateRooms {} ', roomModels)();

    return roomModels;
  }

  get online(): number[] {
    return Object.keys(this.onlineDict).map(a => parseInt(a, 10));
  }

  get channelsDictUI(): ChannelsDictUIModel {
    let result : ChannelsDictUIModel = this.roomsArray.reduce((dict, current: RoomModel) => {
      let channelId = current.channelId;
      if (channelId) {
        if (!dict[channelId]) {
          let channel = this.channelsDict[channelId];
          if (!channel) {
            throw Error(`Unknown channel ${channelId}`)
          }
          dict[channelId] = {
            id: channel.id,
            expanded: channel.expanded,
            rooms: [],
            name: channel.name,
            creator: channel.creator,
          };
        }
        dict[channelId].rooms.push(current);
      }
      return dict;
    } , {} as ChannelsDictUIModel)

    const allChannels: ChannelsDictUIModel = Object.keys(this.channelsDict)
        .filter(k => !result[k]).reduce(((previousValue, currentValue) => {
            previousValue[currentValue] = {
              ...this.channelsDict[currentValue],
              rooms: []
            };
            return previousValue;
          }), result);

    logger.debug('Channels dict {} ', allChannels)();

    return allChannels;
  }

  get channels(): ChannelUIModel[] {
    return Object.values(this.channelsDictUI);
  }

  get myId(): number | null {
    return this.userInfo?.userId ?? null;
  }

  get privateRoomsUsersIds(): PrivateRoomsIds {
    const roomUsers: { [id: number]: number } = {};
    const userRooms: { [id: number]: number } = {};
    if (this.userInfo) {
      const myId = this.myId;
      this.privateRooms.forEach((r: RoomModel) => {
        const anotherUId = myId === r.users[0] && r.users.length === 2 ? r.users[1] : r.users[0];
        roomUsers[r.id] = anotherUId;
        userRooms[anotherUId] = r.id;
      });
    }

    return {roomUsers, userRooms};
  }

  get roomsArray(): RoomModel[] {
    const anies = Object.values(this.roomsDict);
    logger.debug('roomsArray {}', anies)();

    return anies;
  }

  get publicRooms(): RoomModel[] {
    const roomModels: RoomModel[] = this.roomsArray.filter(r => r.name && !r.channelId);
    logger.debug('publicRooms {} ', roomModels)();

    return roomModels;
  }

  get usersArray(): UserModel[] {
    const res: UserModel[] = Object.values(this.allUsersDict);
    logger.debug('usersArray {}', res)();

    return res;
  }

  get maxId(): (a: number) => number | null {
    return (id: number) => {
      const messages = this.roomsDict[id].messages;
      let maxId: number | null = null;
      for (const m in messages) {
        if (!maxId || !(messages[m].id <= maxId)) {
          maxId = messages[m].id;
        }
      }
      logger.debug('maxId #{}={}', id, maxId)();

      return maxId;
    };
  }

  get minId(): (id: number) => number|undefined{
    return (id: number) => {
      const messages = this.roomsDict[id].messages;
      let minId: number|undefined = undefined; // should be undefined otherwise we will trigger less than 0
      for (const m in messages) {
        const id = messages[m].id;
        if (id > 0 && (!minId || id < minId)) {
          minId = id;
        }
      }
      logger.debug('minId #{}={}', id, minId)();

      return minId;
    };
  }

  get activeRoom(): RoomModel | null {
    if (this.activeRoomId) {
      return this.roomsDict[this.activeRoomId];
    } else {
      return null;
    }
  }

  get activeUser(): UserModel | null {
    return this.activeUserId ? this.allUsersDict[this.activeUserId] : null;
  }

  get showNav() {
    return !this.editedMessage && !this.activeUserId;
  }

  get editingMessageModel(): MessageModel | null {
    logger.debug('Eval editingMessageModel')();
    if (this.editedMessage) {
      return this.roomsDict[this.editedMessage.roomId].messages[this.editedMessage.messageId];
    } else {
      return null;
    }
  }

  @Mutation
  public setMessageProgress(payload: SetMessageProgress) {
    const transfer = this.roomsDict[payload.roomId].messages[payload.messageId].transfer;
    if (transfer && transfer.upload) {
      transfer.upload.uploaded = payload.uploaded;
    } else {
      throw Error(`Transfer upload doesn't exist ${JSON.stringify(this.state)} ${JSON.stringify(payload)}`);
    }

  }

  @Mutation
  public markMessageAsRead(payload: MarkMessageAsRead) {
    this.roomsDict[payload.roomId].messages[payload.messageId].isHighlighted = false;
  }

  @Mutation
  public setStorage(payload: IStorage) {
    this.storage = payload;
  }

  @Mutation
  public setUploadProgress(payload: SetUploadProgress) {
    const message = this.roomsDict[payload.roomId].messages[payload.messageId];
    if (message.transfer) {
      message.transfer.upload = payload.upload;
    } else {
      throw Error(`Transfer upload doesn't exist ${JSON.stringify(this.state)} ${JSON.stringify(payload)}`);
    }
  }

  @Mutation
  public setIncomingCall(payload: IncomingCallModel | null) {
    this.incomingCall = payload;
  }

  @Mutation
  @Validate
  public setCallOpponent(payload: SetCallOpponent) {
    if (payload.callInfoModel) {
      Vue.set(this.roomsDict[payload.roomId].callInfo.calls, payload.opponentWsId, payload.callInfoModel);
    } else {
      Vue.delete(this.roomsDict[payload.roomId].callInfo.calls, payload.opponentWsId);
    }
  }

  @Mutation
  @Validate
  public setOpponentVoice(payload: SetOpponentVoice) {
    this.roomsDict[payload.roomId].callInfo.calls[payload.opponentWsId].opponentCurrentVoice = payload.voice;
  }

  @Mutation
  public setOpponentAnchor(payload: SetOpponentAnchor) {
    let key = null;
    for (let k in this.mediaObjects) {
      if (this.mediaObjects[k] === payload.anchor) {
        key = k;
      }
    }
    if (!key) {
      key = mediaLinkIdGetter();
      this.roomsDict[payload.roomId].callInfo.calls[payload.opponentWsId].mediaStreamLink = key;
      Vue.set(this.mediaObjects, key, payload.anchor);
    }
  }

  @Mutation
  public setDim(payload: boolean) {
    this.dim = payload;
  }

  @Mutation
  public addSendingFile(payload: SendingFile) {
    Vue.set(this.roomsDict[payload.roomId].sendingFiles, payload.connId, payload);
  }

  @Mutation
  public expandChannel(channelid: number) {
    this.channelsDict[channelid].expanded = !this.channelsDict[channelid].expanded;
  }

  @Mutation
  public toggleContainer(roomId: number) {
    this.roomsDict[roomId].callInfo.callContainer = !this.roomsDict[roomId].callInfo.callContainer;
  }

  @Mutation
  public setContainerToState(payload: BooleanIdentifier) {
    this.roomsDict[payload.id].callInfo.callContainer = payload.state;
  }

  @Mutation
  public setCurrentMicLevel(payload: NumberIdentifier) {
    this.roomsDict[payload.id].callInfo.currentMicLevel = payload.state;
  }

  @Mutation
  public setCurrentMic(payload: StringIdentifier) {
    this.roomsDict[payload.id].callInfo.currentMic = payload.state;
  }

  @Mutation
  public setCurrentSpeaker(payload: StringIdentifier) {
    this.roomsDict[payload.id].callInfo.currentSpeaker = payload.state;
  }

  @Mutation
  public setCurrentWebcam(payload: StringIdentifier) {
    this.roomsDict[payload.id].callInfo.currentWebcam = payload.state;
  }

  @Mutation
  public setMicToState(payload: BooleanIdentifier) {
    this.roomsDict[payload.id].callInfo.showMic = payload.state;
  }

  @Mutation
  public setVideoToState(payload: BooleanIdentifier) {
    const ci = this.roomsDict[payload.id].callInfo;
    ci.showVideo = payload.state;
    ci.shareScreen = false;
  }

  @Mutation
  public setDevices(payload: SetDevices) {
    this.microphones = payload.microphones;
    this.webcams = payload.webcams;
    this.speakers = payload.speakers;
  }

  @Mutation
  public setShareScreenToState(payload: BooleanIdentifier) {
    const ci = this.roomsDict[payload.id].callInfo;
    ci.shareScreen = payload.state;
    ci.showVideo = false;
  }

  @Mutation
  public setCallActiveToState(payload: BooleanIdentifier) {
    this.roomsDict[payload.id].callInfo.callActive = payload.state;
  }

  @Mutation
  @Validate
  public setLocalStreamSrc(payload: MediaIdentifier) {
    const key: string = mediaLinkIdGetter();
    Vue.set(this.mediaObjects, key, payload.media);
    this.roomsDict[payload.id].callInfo.mediaStreamLink = key;
  }

  @Mutation
  public addReceivingFile(payload: ReceivingFile) {
    Vue.set(this.roomsDict[payload.roomId].receivingFiles, payload.connId, payload);
  }

  @Mutation
  @Validate
  public addSendingFileTransfer(payload: AddSendingFileTransfer) {
    Vue.set(this.roomsDict[payload.roomId].sendingFiles[payload.connId].transfers, payload.transferId, payload.transfer);
  }

  @Mutation
  public setReceivingFileStatus(payload: SetReceivingFileStatus) {
    const receivingFile: ReceivingFile = this.roomsDict[payload.roomId].receivingFiles[payload.connId];
    receivingFile.status = payload.status;
    if (payload.error !== undefined) {
      receivingFile.error = payload.error;
    }
    if (payload.anchor !== undefined) {
      receivingFile.anchor = payload.anchor;
    }
  }

  @Mutation
  @Validate
  public setSendingFileStatus(payload: SetSendingFileStatus) {
    const transfer: SendingFileTransfer = this.roomsDict[payload.roomId].sendingFiles[payload.connId].transfers[payload.transfer];
    transfer.status = payload.status;
    if (payload.error !== undefined) {
      transfer.error = payload.error;
    }
  }

  @Mutation
  public setSendingFileUploaded(payload: SetSendingFileUploaded) {
    const transfer: SendingFileTransfer = this.roomsDict[payload.roomId].sendingFiles[payload.connId].transfers[payload.transfer];
    transfer.upload.uploaded = payload.uploaded;
  }

  @Mutation
  public setReceivingFileUploaded(payload: SetReceivingFileUploaded) {
    const transfer: ReceivingFile = this.roomsDict[payload.roomId].receivingFiles[payload.connId];
    transfer.upload.uploaded = payload.uploaded;
  }

  @Mutation
  public incNewMessagesCount(roomId: number) {
    this.roomsDict[roomId].newMessagesCount++;
  }

  // resetNewMessagesCount(roomId: number) {
  //   this.roomsDict[roomId].newMessagesCount = 0;
  // }

  @Mutation
  public removeMessageProgress(payload: RemoveMessageProgress) {
    const message: MessageModel = this.roomsDict[payload.roomId].messages[payload.messageId];
    message.transfer!.upload = null;
  }

  @Mutation
  public setMessageProgressError(payload: SetMessageProgressError) {
    const mm: MessageModel = this.roomsDict[payload.roomId].messages[payload.messageId];
    mm.transfer!.error = payload.error;
  }

  @Mutation
  public setMessageFileIds(payload: SetFileIdsForMessage) {
    const mm: MessageModel = this.roomsDict[payload.roomId].messages[payload.messageId];
    if (!mm.files) {
      throw Error(`Message ${payload.messageId} in room ${payload.roomId} doesn't have files`);
    }
    payload.fileIds.forEach(fId => {
      mm.files![fId.symbol].id = fId.id;
    });
  }

  @Mutation
  public addMessage(m: MessageModel) {
    const om: { [id: number]: MessageModel } = this.roomsDict[m.roomId].messages;
    Vue.set(om, String(m.id), m);
    this.storage.saveMessage(m);
  }

  @Mutation
  public deleteMessage(rm: RemoveSendingMessage) {
    Vue.delete(this.roomsDict[rm.roomId].messages, String(rm.messageId));
    this.storage.deleteMessage(rm.messageId);
  }

  @Mutation
  public addMessages(ml: MessagesLocation) {
    const om: { [id: number]: MessageModel } = this.roomsDict[ml.roomId].messages;
    ml.messages.forEach(m => {
      Vue.set(om, String(m.id), m);
    });
    this.storage.saveMessages(ml.messages);
  }

  @Mutation
  public setEditedMessage(editedMessage: EditingMessage|null) {
    this.editedMessage = editedMessage;
    this.activeUserId = null;
  }

  @Mutation
  public setSearchTo(payload: SetSearchTo) {
    this.roomsDict[payload.roomId].search = payload.search;
  }

  @Mutation
  public setActiveUserId(activeUserId: number) {
    this.activeUserId = activeUserId;
    this.editedMessage = null;
  }

  @Mutation
  public setAllLoaded(roomId: number) {
    this.roomsDict[roomId].allLoaded = true;
  }

  @Mutation
  public setRoomSettings(srm: RoomSettingsModel) {
    const room = this.roomsDict[srm.id];
    if (room.name !== srm.name) {
      room.changeName.push({
        newName: srm.name,
        oldName: room.name,
        time: Date.now()
      });
    }
    room.notifications = srm.notifications;
    room.volume = srm.volume;
    room.name = srm.name;
    room.p2p = srm.p2p;
    room.channelId = srm.channelId;
    this.storage.updateRoom(srm);
  }

  @Mutation
  public clearMessages() {
    for (const m in this.roomsDict) {
      this.roomsDict[m].messages = {};
    }
    this.storage.clearMessages();
  }

  @Mutation
  public deleteRoom(roomId: number) {
    Vue.delete(this.roomsDict, String(roomId));
    this.storage.deleteRoom(roomId);
  }

  @Mutation
  public setRoomsUsers(ru: SetRoomsUsers) {
    this.roomsDict[ru.roomId].users = ru.users;
    this.storage.saveRoomUsers(ru);
  }

  @Mutation
  public setIsOnline(isOnline: boolean) {
    this.isOnline = isOnline;
  }

  @Mutation
  public addGrowl(growlModel: GrowlModel) {
    this.growls.push(growlModel);
  }

  @Mutation
  public removeGrowl(growlModel: GrowlModel) {
    const index = this.growls.indexOf(growlModel, 0);
    if (index > -1) {
      this.growls.splice(index, 1);
    }
  }

  @Mutation
  public setActiveRoomId(id: number) {
    this.activeRoomId = id;
    if (this.roomsDict[id]) {
      this.roomsDict[id].newMessagesCount = 0;
    }
    this.editedMessage = null;
  }

  @Mutation
  public setRegHeader(regHeader: string) {
    this.regHeader = regHeader;
  }

  @Mutation
  public addUser(u: UserModel) {
    Vue.set(this.allUsersDict, String(u.id), u);
    if (this.roomsDict[ALL_ROOM_ID] && this.roomsDict[ALL_ROOM_ID].users.indexOf(u.id) < 0) {
      this.roomsDict[ALL_ROOM_ID].users.push(u.id);
    }
    this.storage.saveUser(u);
  }

  @Mutation
  public addRoomLog(payload: RoomLogEntry) {
    payload.roomIds.forEach(r => {
      this.roomsDict[r].roomLog.push(payload.roomLog);
    });
  }

  @Mutation
  public setOnline(ids: Record<string, string[]>) {
    this.onlineDict = ids;
  }

  @Mutation
  public setUser(user: UserModel) {
    this.allUsersDict[user.id].user = user.user;
    this.allUsersDict[user.id].sex = user.sex;
    this.storage.saveUser(user);
  }

  @Mutation
  public setUserInfo(userInfo: CurrentUserInfoModel) {
    this.userInfo = userInfo;
    this.storage.setUserProfile(userInfo);
  }

  @Mutation
  public setUserSettings(userInfo: CurrentUserSettingsModel) {
    this.userSettings = userInfo;
    this.storage.setUserSettings(userInfo);
  }

  @Mutation
  public setPastingQueue(ids: string[]) {
    this.pastingImagesQueue = ids;
  }

  @Mutation
  public setUserImage(userImage: string) {
    this.userImage = userImage;
  }

  @Mutation
  public setStateFromWS(state: SetStateFromWS) {
    logger.debug('init store from WS')();

    this.roomsDict = state.roomsDict;
    this.channelsDict = state.channelsDict;
    this.allUsersDict = state.allUsersDict;

    this.storage.setChannels(Object.values(state.channelsDict));
    this.storage.setRooms(Object.values(state.roomsDict));
    this.storage.setUsers(Object.values(state.allUsersDict));
  }

  @Mutation
  // called while restoring from db
  public setStateFromStorage(setRooms: SetStateFromStorage) {
    logger.debug('init store from database')();
    this.roomsDict = setRooms.roomsDict;
    this.userInfo = setRooms.profile;
    this.userSettings = setRooms.settings;
    this.allUsersDict = setRooms.allUsersDict;
    this.channelsDict = setRooms.channelsDict;
  }

  @Mutation
  public addRoom(room: RoomModel) {
    Vue.set(this.roomsDict, String(room.id), room);
    this.storage.saveRoom(room);
  }

  @Mutation
  public addChannel(channel: ChannelModel) {
    Vue.set(this.channelsDict, String(channel.id), channel);
    this.storage.saveChannel(channel);
  }

  @Mutation
  public setShowSmileys(value: boolean) {
    this.showSmileys = value;
  }

  @Mutation
  public deleteChannel(channelId: number) {
    Vue.delete(this.channelsDict, String(channelId));
    this.storage.deleteChannel(channelId);
  }

  @Mutation
  public logout() {
    this.userInfo = null;
    this.userSettings = null;
    this.userImage = null;
    this.roomsDict = {};
    this.allUsersDict = {};
    this.activeUserId = null;
    this.onlineDict = {};
    this.activeRoomId = null;
    this.editedMessage = null;
    this.storage.clearStorage();
  }

  @Action
  public async showGrowl({html, type}: { html: string; type: GrowlType }) {
    const growl: GrowlModel = {id: Date.now(), html, type};
    this.addGrowl(growl);
    await sleep(4000);
    this.removeGrowl(growl);
  }

  @Action
  public async growlErrorRaw(html: string) {
    await this.showGrowl({html, type: GrowlType.ERROR});
  }

  @Action
  public async growlError(title: string) {
    await this.showGrowl({html: encodeHTML(title), type: GrowlType.ERROR});
  }

  @Action
  public async growlInfo(title: string) {
    await this.showGrowl({html: encodeHTML(title), type: GrowlType.INFO});
  }

  @Action
  public async growlSuccess(title: string) {
    await this.showGrowl({html: encodeHTML(title), type: GrowlType.SUCCESS});
  }

}
