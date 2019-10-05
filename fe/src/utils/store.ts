import Vue from 'vue';
import Vuex from 'vuex';

import loggerFactory from '@/utils/loggerFactory';
import {
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
} from '@/types/model';
import {
  AddSendingFileTransfer,
  BooleanIdentifier,
  ChangeOnlineEntry,
  IStorage,
  MediaIdentifier,
  MessagesLocation,
  NumberIdentifier,
  PrivateRoomsIds,
  RemoveMessageProgress,
  RemoveSendingMessage,
  SetCallOpponent,
  SetDevices,
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
} from '@/types/types';
import {SetRooms} from '@/types/dto';
import {encodeHTML} from '@/utils/htmlApi';
import {ALL_ROOM_ID} from '@/utils/consts';
import {Action, Module, Mutation, VuexModule} from 'vuex-module-decorators';

const logger = loggerFactory.getLoggerColor('store', '#6a6400');


Vue.use(Vuex);

function sleep(ms) {
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
  actions: {},
});


@Module({
  dynamic: true,
  namespaced: true,
  name: 'default',
  store: vueStore,
})
export class DefaultStore extends VuexModule {

  storage: IStorage = null;
  isOnline: boolean = false;
  growls: GrowlModel[] = [];
  dim: boolean = false;
  incomingCall: IncomingCallModel = null;
  microphones: { [id: string]: string } = {};
  speakers: { [id: string]: string } = {};
  webcams: { [id: string]: string } = {};
  editedMessage: EditingMessage = null;
  activeRoomId: number = null;
  activeUserId: number = null;
  userInfo: CurrentUserInfoModel = null;
  userSettings: CurrentUserSettingsModel = null;
  userImage: string = null;
  allUsersDict: UserDictModel = {};
  regHeader: string = null;
  online: number[] = [];
  roomsDict: RoomDictModel = {};
  mediaObjects: { [id: string]: MediaStream } = {};

  get userName(): (id: number) => string {
    return (id: number): string => this.allUsersDict[id].user;
  }

  get privateRooms(): RoomModel[] {
    let roomModels: RoomModel[] = this.roomsArray.filter(r => !r.name);
    logger.trace('privateRooms {} ', roomModels)();
    return roomModels;
  }

  get myId(): number {
    return this.userInfo && this.userInfo.userId;
  }

  get privateRoomsUsersIds(): PrivateRoomsIds {
    let roomUsers = {};
    let userRooms = {};
    if (this.userInfo) {
      let myId = this.myId;
      this.privateRooms.forEach((r: RoomModel) => {
        let anotherUId = myId === r.users[0] && r.users.length === 2 ? r.users[1] : r.users[0];
        roomUsers[r.id] = anotherUId;
        userRooms[anotherUId] = r.id;
      });
    }
    return {roomUsers, userRooms};
  }

  get roomsArray(): RoomModel[] {
    let anies = Object.values(this.roomsDict);
    logger.trace('roomsArray {}', anies)();
    return anies;
  }

  get publicRooms(): RoomModel[] {
    let roomModels: RoomModel[] = this.roomsArray.filter(r => r.name);
    logger.trace('publicRooms {} ', roomModels)();
    return roomModels;
  }

  get usersArray(): UserModel[] {
    let res: UserModel[] = Object.values(this.allUsersDict);
    logger.trace('usersArray {}', res)();
    return res;
  }

  get maxId(): SingleParamCB<number> {
    return (id: number) => {
      let messages = this.roomsDict[id].messages;
      let maxId = null;
      for (let m in messages) {
        if (!(messages[m].id <= maxId)) {
          maxId = messages[m].id;
        }
      }
      logger.trace('maxId #{}={}', id, maxId)();
      return maxId;
    };
  }

  get minId(): (id: number) => number {
    return (id: number) => {
      let messages = this.roomsDict[id].messages;
      let minId;
      for (let m in messages) {
        let id = messages[m].id;
        if (id > 0 && (!minId || id < minId)) {
          minId = id;
        }
      }
      logger.trace('minId #{}={}', id, minId)();
      return minId;
    };
  }

  get activeRoom(): RoomModel {
    return this.roomsDict[this.activeRoomId];
  }

  get activeUser(): UserModel {
    return this.allUsersDict[this.activeUserId];
  }

  get showNav() {
    return !this.editedMessage && !this.activeUserId;
  }

  get editingMessageModel(): MessageModel {
    logger.trace('Eval editingMessageModel')();
    if (this.editedMessage) {
      return this.roomsDict[this.editedMessage.roomId].messages[this.editedMessage.messageId];
    } else {
      return null;
    }
  }

  @Mutation
  setMessageProgress(payload: SetMessageProgress) {
    this.roomsDict[payload.roomId].messages[payload.messageId].transfer.upload.uploaded = payload.uploaded;
  }

  @Mutation
  setStorage(payload: IStorage) {
    this.storage = payload;
  }

  @Mutation
  setUploadProgress(payload: SetUploadProgress) {
    this.roomsDict[payload.roomId].messages[payload.messageId].transfer.upload = payload.upload;
  }

  @Mutation
  setIncomingCall(payload: IncomingCallModel) {
    this.incomingCall = payload;
  }

  @Mutation
  setCallOpponent(payload: SetCallOpponent) {
    if (!this.roomsDict[payload.roomId]) { // TODO
      throw Error(`setCallOpponent state: ${JSON.stringify(this.state)}; payload ${JSON.stringify(payload)}`);
    }
    if (payload.callInfoModel) {
      Vue.set(this.roomsDict[payload.roomId].callInfo.calls, payload.opponentWsId, payload.callInfoModel);
    } else {
      Vue.delete(this.roomsDict[payload.roomId].callInfo.calls, payload.opponentWsId);
    }
  }

  @Mutation
  setOpponentVoice(payload: SetOpponentVoice) {
    let roomsDictElement = this.roomsDict[payload.roomId]; // TODO
    if (!roomsDictElement || !roomsDictElement.callInfo || !roomsDictElement.callInfo.calls || !roomsDictElement.callInfo.calls[payload.opponentWsId]) {
      throw Error(`setOpponentVoice state: ${JSON.stringify(this.state)}; payload ${JSON.stringify(payload)}`);
    }
    roomsDictElement.callInfo.calls[payload.opponentWsId].opponentCurrentVoice = payload.voice;
  }

  @Mutation
  setOpponentAnchor(payload: SetOpponentAnchor) {
    let key: string = mediaLinkIdGetter();
    let roomsDictElement = this.roomsDict[payload.roomId]; // TODO
    if (!roomsDictElement || !roomsDictElement.callInfo || !roomsDictElement.callInfo.calls || !roomsDictElement.callInfo.calls[payload.opponentWsId]) {
      throw Error(`setOpponentAnchor state: ${JSON.stringify(this.state)}; payload ${JSON.stringify(payload)}`);
    }
    roomsDictElement.callInfo.calls[payload.opponentWsId].mediaStreamLink = key;
    Vue.set(this.mediaObjects, key, payload.anchor);
  }

  @Mutation
  setDim(payload: boolean) {
    this.dim = payload;
  }

  @Mutation
  addSendingFile(payload: SendingFile) {
    Vue.set(this.roomsDict[payload.roomId].sendingFiles, payload.connId, payload);
  }

  @Mutation
  toggleContainer(roomId: number) {
    this.roomsDict[roomId].callInfo.callContainer = !this.roomsDict[roomId].callInfo.callContainer;
  }

  @Mutation
  setContainerToState(payload: BooleanIdentifier) {
    this.roomsDict[payload.id].callInfo.callContainer = payload.state;
  }

  @Mutation
  setCurrentMicLevel(payload: NumberIdentifier) {
    this.roomsDict[payload.id].callInfo.currentMicLevel = payload.state;
  }

  @Mutation
  setCurrentMic(payload: StringIdentifier) {
    this.roomsDict[payload.id].callInfo.currentMic = payload.state;
  }

  @Mutation
  setCurrentSpeaker(payload: StringIdentifier) {
    this.roomsDict[payload.id].callInfo.currentSpeaker = payload.state;
  }

  @Mutation
  setCurrentWebcam(payload: StringIdentifier) {
    this.roomsDict[payload.id].callInfo.currentWebcam = payload.state;
  }

  @Mutation
  setMicToState(payload: BooleanIdentifier) {
    this.roomsDict[payload.id].callInfo.showMic = payload.state;
  }

  @Mutation
  setVideoToState(payload: BooleanIdentifier) {
    let ci = this.roomsDict[payload.id].callInfo;
    ci.showVideo = payload.state;
    ci.shareScreen = false;
  }

  @Mutation
  setDevices(payload: SetDevices) {
    this.microphones = payload.microphones;
    this.webcams = payload.webcams;
    this.speakers = payload.speakers;
  }

  @Mutation
  setShareScreenToState(payload: BooleanIdentifier) {
    let ci = this.roomsDict[payload.id].callInfo;
    ci.shareScreen = payload.state;
    ci.showVideo = false;
  }

  @Mutation
  setCallActiveToState(payload: BooleanIdentifier) {
    this.roomsDict[payload.id].callInfo.callActive = payload.state;
  }

  @Mutation
  setLocalStreamSrc(payload: MediaIdentifier) {
    let key: string = mediaLinkIdGetter();
    Vue.set(this.mediaObjects, key, payload.media);
    if (!this.roomsDict[payload.id]) { // TODO
      throw Error(`setLocalStreamSrc roomDict ${JSON.stringify(this.roomsDict)}, ${JSON.stringify(payload)}`);
    }
    this.roomsDict[payload.id].callInfo.mediaStreamLink = key;
  }

  @Mutation
  addReceivingFile(payload: ReceivingFile) {
    Vue.set(this.roomsDict[payload.roomId].receivingFiles, payload.connId, payload);
  }

  @Mutation
  addSendingFileTransfer(payload: AddSendingFileTransfer) {
    if (!this.roomsDict[payload.roomId].sendingFiles[payload.connId]) { // TODO
      throw Error(`addSendingFileTransfer state: ${JSON.stringify(this.state)}; payload ${JSON.stringify(payload)}`);
    }
    Vue.set(this.roomsDict[payload.roomId].sendingFiles[payload.connId].transfers, payload.transferId, payload.transfer);
  }

  @Mutation
  setReceivingFileStatus(payload: SetReceivingFileStatus) {
    let receivingFile: ReceivingFile = this.roomsDict[payload.roomId].receivingFiles[payload.connId];
    receivingFile.status = payload.status;
    if (payload.error !== undefined) {
      receivingFile.error = payload.error;
    }
    if (payload.anchor !== undefined) {
      receivingFile.anchor = payload.anchor;
    }
  }

  @Mutation
  setSendingFileStatus(payload: SetSendingFileStatus) {
    let transfer: SendingFileTransfer = this.roomsDict[payload.roomId].sendingFiles[payload.connId].transfers[payload.transfer];
    if (!transfer) {  // TODO
      throw Error(`setSendingFileStatus state: ${JSON.stringify(this.state)}; payload ${JSON.stringify(payload)}`);
    }
    transfer.status = payload.status;
    if (payload.error !== undefined) {
      transfer.error = payload.error;
    }
  }

  @Mutation
  setSendingFileUploaded(payload: SetSendingFileUploaded) {
    let transfer: SendingFileTransfer = this.roomsDict[payload.roomId].sendingFiles[payload.connId].transfers[payload.transfer];
    transfer.upload.uploaded = payload.uploaded;
  }

  @Mutation
  setReceivingFileUploaded(payload: SetReceivingFileUploaded) {
    let transfer: ReceivingFile = this.roomsDict[payload.roomId].receivingFiles[payload.connId];
    transfer.upload.uploaded = payload.uploaded;
  }

  @Mutation
  incNewMessagesCount(roomId: number) {
    this.roomsDict[roomId].newMessagesCount++;
  }

  // resetNewMessagesCount(roomId: number) {
  //   this.roomsDict[roomId].newMessagesCount = 0;
  // }

  @Mutation
  removeMessageProgress(payload: RemoveMessageProgress) {
    let message: MessageModel = this.roomsDict[payload.roomId].messages[payload.messageId];
    message.transfer.upload = null;
  }

  @Mutation
  setMessageProgressError(payload: SetMessageProgressError) {
    let mm: MessageModel = this.roomsDict[payload.roomId].messages[payload.messageId];
    mm.transfer.error = payload.error;
  }

  @Mutation
  addMessage(m: MessageModel) {
    let om: { [id: number]: MessageModel } = this.roomsDict[m.roomId].messages;
    Vue.set(om, String(m.id), m);
    this.storage.saveMessage(m);
  }

  @Mutation
  deleteMessage(rm: RemoveSendingMessage) {
    Vue.delete(this.roomsDict[rm.roomId].messages, String(rm.messageId));
    this.storage.deleteMessage(rm.messageId);
  }

  @Mutation
  addMessages(ml: MessagesLocation) {
    let om: { [id: number]: MessageModel } = this.roomsDict[ml.roomId].messages;
    ml.messages.forEach(m => {
      Vue.set(om, String(m.id), m);
    });
    this.storage.saveMessages(ml.messages);
  }

  @Mutation
  setEditedMessage(editedMessage: EditingMessage) {
    this.editedMessage = editedMessage;
    this.activeUserId = null;
  }

  @Mutation
  setSearchTo(payload: SetSearchTo) {
    this.roomsDict[payload.roomId].search = payload.search;
  }

  @Mutation
  setActiveUserId(activeUserId: number) {
    this.activeUserId = activeUserId;
    this.editedMessage = null;
  }

  @Mutation
  setAllLoaded(roomId: number) {
    this.roomsDict[roomId].allLoaded = true;
  }

  @Mutation
  setRoomSettings(srm: RoomSettingsModel) {
    let room = this.roomsDict[srm.id];
    room.notifications = srm.notifications;
    room.volume = srm.volume;
    room.name = srm.name;
    this.storage.updateRoom(srm);
  }

  @Mutation
  clearMessages() {
    for (let m in this.roomsDict) {
      this.roomsDict[m].messages = {};
    }
    this.storage.clearMessages();
  }

  @Mutation
  deleteRoom(roomId: number) {
    Vue.delete(this.roomsDict, String(roomId));
    this.storage.deleteRoom(roomId);
  }

  @Mutation
  setRoomsUsers(ru: SetRoomsUsers) {
    this.roomsDict[ru.roomId].users = ru.users;
    this.storage.saveRoomUsers(ru);
  }

  @Mutation
  setIsOnline(isOnline: boolean) {
    this.isOnline = isOnline;
  }

  @Mutation
  addGrowl(growlModel: GrowlModel) {
    this.growls.push(growlModel);
  }

  @Mutation
  removeGrowl(growlModel: GrowlModel) {
    let index = this.growls.indexOf(growlModel, 0);
    if (index > -1) {
      this.growls.splice(index, 1);
    }
  }

  @Mutation
  setActiveRoomId(id: number) {
    this.activeRoomId = id;
    if (this.roomsDict[id]) {
      this.roomsDict[id].newMessagesCount = 0;
    }
    this.editedMessage = null;
  }

  @Mutation
  setRegHeader(regHeader: string) {
    this.regHeader = regHeader;
  }

  @Mutation
  addUser(u: UserModel) {
    Vue.set(this.allUsersDict, String(u.id), u);
    if (this.roomsDict[ALL_ROOM_ID] && this.roomsDict[ALL_ROOM_ID].users.indexOf(u.id) < 0) {
      this.roomsDict[ALL_ROOM_ID].users.push(u.id);
    }
    this.storage.saveUser(u);
  }

  @Mutation
  addChangeOnlineEntry(payload: ChangeOnlineEntry) {
    payload.roomIds.forEach(r => {
      this.roomsDict[r].changeOnline.push(payload.changeOnline);
    });
  }

  @Mutation
  setOnline(ids: number[]) {
    this.online = ids;
  }

  @Mutation
  setUsers(users: UserDictModel) {
    this.allUsersDict = users;
    this.storage.setUsers(Object.values(users));
  }

  @Mutation
  setUser(user: UserModel) {
    this.allUsersDict[user.id].user = user.user;
    this.allUsersDict[user.id].sex = user.sex;
    this.storage.saveUser(user);
  }

  @Mutation
  setUserInfo(userInfo: CurrentUserInfoModel) {
    this.userInfo = userInfo;
    this.storage.setUserProfile(userInfo);
  }

  @Mutation
  setUserSettings(userInfo: CurrentUserSettingsModel) {
    this.userSettings = userInfo;
    this.storage.setUserSettings(userInfo);
  }

  @Mutation
  setUserImage(userImage: string) {
    this.userImage = userImage;
  }

  @Mutation
  setRooms(rooms: RoomDictModel) {
    this.roomsDict = rooms;
    this.storage.setRooms(Object.values(rooms));
  }

  @Mutation
  init(setRooms: SetRooms) {
    this.roomsDict = setRooms.roomsDict;
    this.userInfo = setRooms.profile;
    this.userSettings = setRooms.settings;
    this.allUsersDict = setRooms.allUsersDict;
  }

  @Mutation
  addRoom(room: RoomModel) {
    Vue.set(this.roomsDict, String(room.id), room);
    this.storage.saveRoom(room);
  }

  @Mutation
  logout() {
    this.userInfo = null;
    this.userSettings = null;
    this.userImage = null;
    this.roomsDict = {};
    this.allUsersDict = {};
    this.activeUserId = null;
    this.online = [];
    this.activeRoomId = null;
    this.editedMessage = null;
    this.storage.clearStorage();
  }


  @Action
  async showGrowl({html, type}) {
    let growl: GrowlModel = {id: Date.now(), html, type};
    this.addGrowl(growl);
    await sleep(4000);
    this.removeGrowl(growl);
  }

  @Action
  async growlErrorRaw( html) {
    await this.showGrowl({html, type: GrowlType.ERROR});
  }

  @Action
  async growlError(title) {
    await this.showGrowl({html: encodeHTML(title), type: GrowlType.ERROR});
  }

  @Action
  async growlInfo( title) {
    await this.showGrowl({html: encodeHTML(title), type: GrowlType.INFO});
  }

  @Action
  async growlSuccess(title) {
    await this.showGrowl({html: encodeHTML(title), type: GrowlType.SUCCESS});
  }

}
