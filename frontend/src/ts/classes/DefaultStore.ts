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
  MessageStatus,
  PastingTextAreaElement,
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
  RoomMessageIds,
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
  SetSendingFileStatus,
  SetSendingFileUploaded,
  SetUploadProgress,
  StringIdentifier,
  LiveConnectionLocation,
  RoomMessagesIds,
  ShareIdentifier,
  SetSearchStateTo,
  SetSearchTextTo,
  SetUploadXHR
} from '@/ts/types/types';
import {
  SetStateFromStorage,
  SetStateFromWS
} from '@/ts/types/dto';
import { encodeHTML } from '@/ts/utils/htmlApi';
import {
  ALL_ROOM_ID,
  SHOW_I_TYPING_INTERVAL
} from '@/ts/utils/consts';
import {
  Action,
  Module,
  Mutation,
  VuexModule
} from 'vuex-module-decorators';

const logger = loggerFactory.getLogger('store');

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

export const vueStore = new Vuex.Store({
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

const SHOW_I_TYPING_INTERVAL_SHOW = SHOW_I_TYPING_INTERVAL * 1.5;

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
  public pastingTextAreaQueue: PastingTextAreaElement[] = [];
  public incomingCall: IncomingCallModel | null = null;
  public microphones: { [id: string]: string } = {};
  public speakers: { [id: string]: string } = {};
  public webcams: { [id: string]: string } = {};
  public activeRoomId: number | null = null;
  public userInfo: CurrentUserInfoModel | null = null;
  public userSettings: CurrentUserSettingsModel | null = null;
  public userImage: string | null = null;
  public allUsersDict: UserDictModel = {};
  public regHeader: string | null = null;
  public onlineDict: Record<string, string[]> = {};
  public roomsDict: RoomDictModel = {};
  public channelsDict: ChannelsDictModel = {};
  public mediaObjects: { [id: string]: MediaStream } = {};
  public isCurrentWindowActive: boolean = true;
  public currentChatPage: 'rooms' | 'chat' = 'chat';

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

  get calculatedMessagesForRoom() : (roomId: number) => any[] {
    return (roomId: number): any[] => {
      let room = this.roomsDict[roomId];
      let newArray: any[] = room.roomLog.map(value => ({
        isUserAction: true,
        ...value
      }));
      newArray.push(...room.changeName.map(value => ({isChangeName: true, ...value})));
      let dates: {[id: string]: boolean} = {};
      let messageDict: Record<number, {parent?: MessageModel, messages: (MessageModel|ReceivingFile|SendingFile)[]}> = {};
      for (let m in room.messages) {
        let message = room.messages[m];
        if (message.parentMessage) {
          if (!messageDict[message.parentMessage]) {
            messageDict[message.parentMessage] = {messages: []}
          }
          messageDict[message.parentMessage].messages.push(message)
        } else {
          if (!messageDict[message.id]) {
            messageDict[message.id] = {messages: []}
          }
          messageDict[message.id].parent = message;
          let d = new Date(message.time).toDateString();
          if (!dates[d]) {
            dates[d] = true;
            newArray.push({fieldDay: d, time: Date.parse(d)});
          }
        }
      }
      for (let m in room.sendingFiles) {
        let sendingFile: SendingFile = room.sendingFiles[m];
        if (sendingFile.threadId) {
          if (messageDict[sendingFile.threadId]) {
            messageDict[sendingFile.threadId].messages.push(sendingFile);
          } else {
            logger.warn(`Receiving file {} won't be dispayed as thread ${sendingFile.threadId} is not loaded yet`)();
          }
        } else {
          newArray.push(sendingFile);
        }
      }
      for (let m in room.receivingFiles) {
        let receivingFile: ReceivingFile = room.receivingFiles[m];
        if (receivingFile.threadId) {
          if (messageDict[receivingFile.threadId]) {
            messageDict[receivingFile.threadId].messages.push(receivingFile);
          } else {
            logger.warn(`Receiving file {} won't be dispayed as thread ${receivingFile.threadId} is not loaded yet`)();
          }
        } else {
          newArray.push(receivingFile);
        }
      }
      Object.values(messageDict).forEach(v => {
        if (v.messages.length || v.parent?.isThreadOpened || (v.parent && v.parent.threadMessagesCount > 0)) {
          if (v.parent) {
            v.messages.sort((a, b) => a.time > b.time ? 1 : a.time < b.time ? -1 : 0);
            newArray.push({parent: v.parent, thread: true, messages: v.messages, time: v.parent.time});
          } else {
            logger.warn(`Skipping rendering messages ${v.messages.map(m => (m as MessageModel).id)} as parent is not loaded yet`)()
          }
        } else {
          newArray.push(v.parent)
        }
      });
      newArray.sort((a, b) => a.time > b.time ? 1 : a.time < b.time ? -1 : 0);
      logger.debug("Reevaluating messages in room #{}: {}", room.id, newArray)();
      return newArray;
    }
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

  get activeRoom(): RoomModel | null {
    if (this.activeRoomId && this.roomsDict) {
      return this.roomsDict[this.activeRoomId];
    } else {
      return null;
    }
  }

  get activeRoomOnline(): string[] {
    let online: string[] = [];
    if (this.activeRoom) {
      this.activeRoom.users.forEach(u => {
        if (this.onlineDict[u]) {
          online.push(...this.onlineDict[u]);
        }
      });
    }
    return online;
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
  public setCurrentChatPage(currentChatPage: 'rooms' | 'chat') {
    this.currentChatPage = currentChatPage;
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
  public setUploadXHR(payload: SetUploadXHR) {
    const message = this.roomsDict[payload.roomId].messages[payload.messageId];
    if (message.transfer) {
      message.transfer.xhr = payload.xhr;
    } else {
      throw Error(`Transfer upload doesn't exist ${JSON.stringify(this.state)} ${JSON.stringify(payload)}`);
    }
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
    // TODO do we need to fire watch if track added but stream hasn't changed?
      let key = mediaLinkIdGetter();
      this.roomsDict[payload.roomId].callInfo.calls[payload.opponentWsId].mediaStreamLink = key;
      Vue.set(this.mediaObjects, key, payload.anchor);
    }
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
  public setCurrentMicLevel(payload: NumberIdentifier) {
    this.roomsDict[payload.id].callInfo.currentMicLevel = payload.state;
  }

  @Mutation
  public setCurrentMic(payload: StringIdentifier) {
    this.roomsDict[payload.id].callInfo.currentMic = payload.state;
  }

  @Mutation
  public setIsCurrentWindowActive(payload: boolean) {
    this.isCurrentWindowActive = payload;
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
  public setVideoToState(payload: ShareIdentifier) {
    const ci = this.roomsDict[payload.id].callInfo;
    ci.shareScreen = false;
    ci.sharePaint = false;
    ci.showVideo = false;
    if (payload.type === 'desktop') {
      ci.shareScreen = payload.state;
    } else if (payload.type === 'webcam') {
      ci.showVideo = payload.state;
    }  else if (payload.type === 'paint') {
      ci.sharePaint = payload.state;
    }
  }

  @Mutation
  public setDevices(payload: SetDevices) {
    this.microphones = payload.microphones;
    this.webcams = payload.webcams;
    this.speakers = payload.speakers;
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

  @Mutation
  public setMessagesStatus(
      {
        roomId,
        messagesIds,
        status,
      }: {
        roomId: number;
        messagesIds: number[];
        status: MessageStatus;
      }
  ) {
    let ids = Object.values(this.roomsDict[roomId].messages)
        .filter(m => messagesIds.includes(m.id))
        .map(m => {
          m.status = status;
          return m.id;
    });
    if (ids.length) {
      this.storage.setMessagesStatus(ids, status);
    }
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
    Object.keys(payload.fileIds).forEach(symb => {
      mm.files![symb].fileId = payload.fileIds[symb].fileId || null;
      mm.files![symb].previewFileId = payload.fileIds[symb].previewFileId || null;
    });
    this.storage.updateFileIds(payload);
  }

  @Mutation
  public addMessage(m: MessageModel) {
    const om: { [id: number]: MessageModel } = this.roomsDict[m.roomId].messages;
    Vue.set(om, String(m.id), m);
    this.storage.saveMessage(m);
  }

  @Mutation
  public addLiveConnectionToRoom(m: LiveConnectionLocation) {
    if (this.roomsDict[m.roomId].p2pInfo.liveConnections.indexOf(m.connection) >= 0) {
      throw Error('This connection is already here');
    }
    this.roomsDict[m.roomId].p2pInfo.liveConnections.push(m.connection);
  }

  @Mutation
  public removeLiveConnectionToRoom(m: LiveConnectionLocation) {
    let indexOf = this.roomsDict[m.roomId].p2pInfo.liveConnections.indexOf(m.connection);
    if (indexOf < 0) {
      throw Error('This connection is not present');
    }
    this.roomsDict[m.roomId].p2pInfo.liveConnections.splice(indexOf, 1);
  }

  @Mutation
  public markMessageAsSent(m: RoomMessagesIds) {
    let markSendingIds: number[] = []
    m.messagesId.forEach(messageId => {
      let message = this.roomsDict[m.roomId].messages[messageId];
      if (message.status === 'sending') {
        message.status = 'on_server';
        markSendingIds.push(messageId);
      }
    });
    this.storage.markMessageAsSent(markSendingIds);

  }

  @Mutation
  public deleteMessage(rm: RoomMessageIds) {
    let messages = this.roomsDict[rm.roomId].messages;
    Vue.delete(messages, String(rm.messageId));
    Object.values(messages)
        .filter(m => m.parentMessage === rm.messageId)
        .forEach(a => a.parentMessage = rm.newMessageId);
    this.storage.deleteMessage(rm.messageId, rm.newMessageId);
  }

  @Mutation
  public increaseThreadMessageCount({roomId, messageId}: {roomId: number; messageId: number}) {
    let message = this.roomsDict[roomId].messages[messageId];
    message.threadMessagesCount++;
    this.storage.setThreadMessageCount(messageId, message.threadMessagesCount);
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
  public addSearchMessages(ml: MessagesLocation) {
    const om: Record<number, MessageModel> = this.roomsDict[ml.roomId].search.messages;
    ml.messages.forEach(m => {
      Vue.set(om, String(m.id), m);
    });
  }

  @Mutation
  public setSearchTextTo(ml: SetSearchTextTo) {
    this.roomsDict[ml.roomId].search.messages = [];
    this.roomsDict[ml.roomId].search.searchText = ml.searchText;
    this.roomsDict[ml.roomId].search.locked = false;
  }

  @Mutation
  public setEditedMessage(editedMessage: EditingMessage) {
    this.roomsDict[editedMessage.roomId].messages[editedMessage.messageId].isEditingActive = editedMessage.isEditingNow;
  }

  @Mutation
  public setCurrentThread(editingThread: EditingMessage) {
    let m: MessageModel = this.roomsDict[editingThread.roomId].messages[editingThread.messageId];
    m.isThreadOpened = editingThread.isEditingNow;
  }

  @Mutation
  public setSearchStateTo(payload: SetSearchStateTo) {
    this.roomsDict[payload.roomId].search.locked = payload.lock;
  }

  @Mutation
  public toogleSearch(roomId: number) {
    this.roomsDict[roomId].search.searchActive = !this.roomsDict[roomId].search.searchActive;
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
  public setCallActiveButNotJoinedYet(payload: BooleanIdentifier) {
    this.roomsDict[payload.id].callInfo.callActiveButNotJoinedYet = payload.state;
  }

  @Mutation
  public setOnline(ids: Record<string, string[]>) {
    Object.keys(ids).forEach(k => {
      if (ids[k].length === 0) {
        delete ids[k];
      }
    });
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
  public setPastingQueue(ids: PastingTextAreaElement[]) {
    this.pastingTextAreaQueue = ids;
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
  public deleteChannel(channelId: number) {
    Vue.delete(this.channelsDict, String(channelId));
    this.storage.deleteChannel(channelId);
  }

  @Mutation
  public setShowITypingUser({userId, roomId, date}: {userId: number; roomId: number; date: number}) {
    if (date === 0) {
      Vue.delete(this.roomsDict[roomId].usersTyping, userId);
    } else {
      Vue.set(this.roomsDict[roomId].usersTyping, userId, date);
    }
  }

  @Mutation
  public logout() {
    this.userInfo = null;
    this.userSettings = null;
    this.userImage = null;
    this.roomsDict = {};
    this.allUsersDict = {};
    this.onlineDict = {};
    this.activeRoomId = null;
    this.storage.clearStorage();
  }

  @Action
  public async showGrowl({html, type, time}: { html: string; type: GrowlType; time: number }) {
    const growl: GrowlModel = {id: Date.now(), html, type};
    this.addGrowl(growl);
    await sleep(time);
    this.removeGrowl(growl);
  }

  @Action
  public async showUserIsTyping({userId, roomId}: {userId: number; roomId: number}) {
    let date = Date.now();
    this.setShowITypingUser({userId, roomId, date});
    await sleep(SHOW_I_TYPING_INTERVAL_SHOW); // lets say 1 second ping
    if (this.roomsDict[roomId].usersTyping[userId] === date) {
      this.setShowITypingUser({userId, roomId, date: 0});
    }
  }

  @Action
  public async growlErrorRaw(html: string) {
    await this.showGrowl({html, type: GrowlType.ERROR, time: 6000});
  }

  @Action
  public async growlError(title: string) {
    await this.showGrowl({html: encodeHTML(title), type: GrowlType.ERROR, time: 6000});
  }

  @Action
  public async growlInfo(title: string) {
    await this.showGrowl({html: encodeHTML(title), type: GrowlType.INFO, time: 5000});
  }

  @Action
  public async growlSuccess(title: string) {
    await this.showGrowl({html: encodeHTML(title), type: GrowlType.SUCCESS, time: 4000});
  }

}
