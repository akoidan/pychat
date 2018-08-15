import Vue from 'vue';
import Vuex, {StoreOptions} from 'vuex';
import {ActionContext} from 'vuex/types';
import loggerFactory from './utils/loggerFactory';
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
  RootState,
  SendingFile,
  SendingFileTransfer,
  UserDictModel,
  UserModel
} from './types/model';
import {
  AddSendingFileTransfer,
  BooleanIdentifier,
  ChangeOnlineEntry,
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
} from './types/types';
import {storage} from './utils/singletons';
import {SetRooms} from './types/dto';
import {encodeHTML} from './utils/htmlApi';

Vue.use(Vuex);

interface State extends ActionContext<RootState, RootState> {}

const logger = loggerFactory.getLoggerColor('store', '#6a6400');


const store: StoreOptions<RootState> = {
  state: {
    isOnline: false,
    growls: [],
    incomingCall: null,
    allUsersDict: {},
    regHeader: null,
    microphones: {},
    speakers: {},
    webcams: {},
    roomsDict: {},
    dim: false,
    activeUserId: null,
    userInfo: null,
    userSettings: null,
    userImage: null,
    online: [],
    activeRoomId: null,
    editedMessage: null,
  },
  getters: {
    userName(state: RootState) {
      return (id: number): string =>  state.allUsersDict[id].user;
    },
    privateRooms(state: RootState, getters): RoomModel[] {
      let roomModels: RoomModel[] = getters.roomsArray.filter(r => !r.name);
      logger.trace('privateRooms {} ', roomModels)();
      return roomModels;
    },
    myId(state: RootState): number {
      return state.userInfo && state.userInfo.userId;
    },
    privateRoomsUsersIds(state: RootState, getters): PrivateRoomsIds {
      let roomUsers = {};
      let userRooms = {};
      if (state.userInfo) {
        let myId = getters.myId;
        getters.privateRooms.forEach((r: RoomModel) => {
          let anotherUId = myId === r.users[0] && r.users.length === 2 ? r.users[1] : r.users[0];
          roomUsers[r.id] = anotherUId;
          userRooms[anotherUId] = r.id;
        });
      }
      return {roomUsers, userRooms};
    },
    roomsArray(state: RootState): RoomModel[] {
      let anies = Object.values(state.roomsDict);
      logger.trace('roomsArray {}', anies)();
      return anies;
    },
    publicRooms(state: RootState, getters): RoomModel[] {
      let roomModels: RoomModel[] = getters.roomsArray.filter(r => r.name);
      logger.trace('publicRooms {} ', roomModels)();
      return roomModels;
    },
    usersArray(state: RootState): UserModel[] {
      let res: UserModel[] = Object.values(state.allUsersDict);
      logger.trace('usersArray {}', res)();
      return res;
    },
    maxId(state: RootState): SingleParamCB<number> {
      return (id: number) => {
        let messages = state.roomsDict[id].messages;
        let maxId = null;
        for (let m in messages ) {
          if (!(messages[m].id <= maxId)) {
            maxId = messages[m].id;
          }
        }
        logger.trace('maxId #{}={}', id, maxId)();
        return maxId;
      };
    },
    minId(state: RootState): SingleParamCB<number> {
      return (id: number) => {
        let messages = state.roomsDict[id].messages;
        let minId;
        for (let m in messages ) {
          let id = messages[m].id;
          if (id > 0 && (!minId || id < minId)) {
            minId = id;
          }
        }
        logger.trace('minId #{}={}', id, minId)();
        return minId;
      };
    },
    activeRoom(state: RootState): RoomModel {
      return state.roomsDict[state.activeRoomId];
    },
    activeUser(state: RootState): UserModel {
      return state.allUsersDict[state.activeUserId];
    },
    showNav(state: RootState) {
      return !state.editedMessage && !state.activeUserId;
    },
    editingMessageModel(state: RootState): MessageModel {
      logger.trace('Eval editingMessageModel')();
      if (state.editedMessage) {
        return state.roomsDict[state.editedMessage.roomId].messages[state.editedMessage.messageId];
      } else {
        return null;
      }
    }
  },
  mutations: {
    setMessageProgress(state: RootState, payload: SetMessageProgress) {
      state.roomsDict[payload.roomId].messages[payload.messageId].transfer.upload.uploaded = payload.uploaded;
    },
    setUploadProgress(state: RootState, payload: SetUploadProgress) {
      state.roomsDict[payload.roomId].messages[payload.messageId].transfer.upload = payload.upload;
    },
    setIncomingCall(state: RootState, payload: IncomingCallModel) {
      state.incomingCall = payload;
    },
    setCallOpponent(state: RootState, payload: SetCallOpponent) {
      if (payload.callInfoModel) {
        Vue.set(state.roomsDict[payload.roomId].callInfo.calls, payload.opponentWsId, payload.callInfoModel);
      } else {
        Vue.delete(state.roomsDict[payload.roomId].callInfo.calls, payload.opponentWsId);
      }
    },
    setOpponentVoice(state: RootState, payload: SetOpponentVoice) {
      state.roomsDict[payload.roomId].callInfo.calls[payload.opponentWsId].opponentCurrentVoice = payload.voice;
    },
    setOpponentAnchor(state: RootState, payload: SetOpponentAnchor) {
      state.roomsDict[payload.roomId].callInfo.calls[payload.opponentWsId].anchor = payload.anchor;
    },
    setDim(state: RootState, payload: boolean) {
      state.dim = payload;
    },
    addSendingFile(state: RootState, payload: SendingFile) {
      Vue.set(state.roomsDict[payload.roomId].sendingFiles, payload.connId, payload);
    },
    toggleContainer(state: RootState, roomId: number) {
      state.roomsDict[roomId].callInfo.callContainer = !state.roomsDict[roomId].callInfo.callContainer;
    },
    setContainerToState(state: RootState, payload: BooleanIdentifier) {
      state.roomsDict[payload.id].callInfo.callContainer = payload.state;
    },
    setCurrentMicLevel(state: RootState, payload: NumberIdentifier) {
      state.roomsDict[payload.id].callInfo.currentMicLevel = payload.state;
    },
    setCurrentMic(state: RootState, payload: StringIdentifier) {
      state.roomsDict[payload.id].callInfo.currentMic = payload.state;
    },
    setCurrentSpeaker(state: RootState, payload: StringIdentifier) {
      state.roomsDict[payload.id].callInfo.currentSpeaker = payload.state;
    },
    setCurrentWebcam(state: RootState, payload: StringIdentifier) {
      state.roomsDict[payload.id].callInfo.currentWebcam = payload.state;
    },
    setMicToState(state: RootState, payload: BooleanIdentifier) {
      state.roomsDict[payload.id].callInfo.showMic = payload.state;
    },
    setVideoToState(state: RootState, payload: BooleanIdentifier) {
      let ci = state.roomsDict[payload.id].callInfo;
      ci.showVideo = payload.state;
      ci.shareScreen = false;
    },
    setDevices(state: RootState, payload: SetDevices) {
      state.microphones = payload.microphones;
      state.webcams = payload.webcams;
      state.speakers = payload.speakers;
    },
    setShareScreenToState(state: RootState, payload: BooleanIdentifier) {
      let ci = state.roomsDict[payload.id].callInfo;
      ci.shareScreen = payload.state;
      ci.showVideo = false;
    },
    setCallActiveToState(state: RootState, payload: BooleanIdentifier) {
      state.roomsDict[payload.id].callInfo.callActive = payload.state;
    },
    setLocalStreamSrc(state: RootState, payload: StringIdentifier) {
      state.roomsDict[payload.id].callInfo.localStreamSrc = payload.state;
    },
    addReceivingFile(state: RootState, payload: ReceivingFile) {
      Vue.set(state.roomsDict[payload.roomId].receivingFiles, payload.connId, payload);
    },
    addSendingFileTransfer(state: RootState, payload: AddSendingFileTransfer) {
      Vue.set(state.roomsDict[payload.roomId].sendingFiles[payload.connId].transfers, payload.transferId, payload.transfer);
    },
    setReceivingFileStatus(state: RootState, payload: SetReceivingFileStatus) {
      let receivingFile: ReceivingFile = state.roomsDict[payload.roomId].receivingFiles[payload.connId];
      receivingFile.status = payload.status;
      if (payload.error !== undefined) {
        receivingFile.error = payload.error;
      }
      if (payload.anchor !== undefined) {
        receivingFile.anchor = payload.anchor;
      }
    },
    setSendingFileStatus(state: RootState, payload: SetSendingFileStatus) {
      let transfer: SendingFileTransfer = state.roomsDict[payload.roomId].sendingFiles[payload.connId].transfers[payload.transfer];
      transfer.status = payload.status;
      if (payload.error !== undefined) {
        transfer.error = payload.error;
      }
    },
    setSendingFileUploaded(state: RootState, payload: SetSendingFileUploaded) {
      let transfer: SendingFileTransfer = state.roomsDict[payload.roomId].sendingFiles[payload.connId].transfers[payload.transfer];
      transfer.upload.uploaded = payload.uploaded;
    },
    setReceivingFileUploaded(state: RootState, payload: SetReceivingFileUploaded) {
      let transfer: ReceivingFile = state.roomsDict[payload.roomId].receivingFiles[payload.connId];
      transfer.upload.uploaded = payload.uploaded;
    },
    incNewMessagesCount(state: RootState, roomId: number) {
      state.roomsDict[roomId].newMessagesCount++;
    },
    // resetNewMessagesCount(state: RootState, roomId: number) {
    //   state.roomsDict[roomId].newMessagesCount = 0;
    // },
    removeMessageProgress(state: RootState, payload: RemoveMessageProgress) {
      let message: MessageModel = state.roomsDict[payload.roomId].messages[payload.messageId];
      message.transfer.upload = null;
    },
    setMessageProgressError(state: RootState, payload: SetMessageProgressError) {
      let mm: MessageModel = state.roomsDict[payload.roomId].messages[payload.messageId];
      mm.transfer.error = payload.error;
    },
    addMessage(state: RootState, m: MessageModel) {
      let om: { [id: number]: MessageModel } = state.roomsDict[m.roomId].messages;
      Vue.set(om, String(m.id), m);
      storage.saveMessage(m);
    },
    deleteMessage(state: RootState, rm: RemoveSendingMessage) {
      Vue.delete(state.roomsDict[rm.roomId].messages, String(rm.messageId));
      storage.deleteMessage(rm.messageId);
    },
    addMessages(state: RootState, ml: MessagesLocation) {
      let om: { [id: number]: MessageModel } = state.roomsDict[ml.roomId].messages;
      ml.messages.forEach(m => {
        Vue.set(om, String(m.id), m);
      });
      storage.saveMessages(ml.messages);
    },
    setEditedMessage(state: RootState, editedMessage: EditingMessage) {
      state.editedMessage = editedMessage;
      state.activeUserId = null;
    },
    setSearchTo(state: RootState, payload: SetSearchTo) {
      state.roomsDict[payload.roomId].search = payload.search;
    },
    setActiveUserId(state: RootState, activeUserId: number) {
      state.activeUserId = activeUserId;
      state.editedMessage = null;
    },
    setAllLoaded(state, roomId: number) {
      state.roomsDict[roomId].allLoaded = true;
    },
    setRoomSettings(state: RootState, srm: RoomSettingsModel) {
      let room = state.roomsDict[srm.id];
      room.notifications = srm.notifications;
      room.volume = srm.volume;
      room.name = srm.name;
      storage.updateRoom(srm);
    },
    clearMessages(state: RootState) {
      for (let m in state.roomsDict) {
        state.roomsDict[m].messages = {};
      }
      storage.clearMessages();
    },
    deleteRoom(state: RootState, roomId: number) {
      Vue.delete(state.roomsDict, String(roomId));
      storage.deleteRoom(roomId);
    },
    setRoomsUsers(state: RootState, ru: SetRoomsUsers) {
      state.roomsDict[ru.roomId].users = ru.users;
      storage.saveRoomUsers(ru);
    },
    setIsOnline(state: RootState, isOnline: boolean) {
      state.isOnline = isOnline;
    },
    addGrowl(state: RootState, growlModel: GrowlModel) {
      state.growls.push(growlModel);
    },
    removeGrowl(state: RootState, growlModel: GrowlModel) {
      let index = state.growls.indexOf(growlModel, 0);
      if (index > -1) {
        state.growls.splice(index, 1);
      }
    },
    setActiveRoomId(state: RootState, id: number) {
      state.activeRoomId = id;
      if (state.roomsDict[id]) {
        state.roomsDict[id].newMessagesCount = 0;
      }
      state.editedMessage = null;
    },
    setRegHeader(state: RootState, regHeader: string) {
      state.regHeader = regHeader;
    },
    addUser(state: RootState, u: UserModel) {
      Vue.set(state.allUsersDict, String(u.id), u);
      storage.saveUser(u);
    },
    addChangeOnlineEntry(state: RootState, payload: ChangeOnlineEntry) {
      payload.roomIds.forEach(r => {
        state.roomsDict[r].changeOnline.push(payload.changeOnline);
      });
    },
    setOnline(state: RootState, ids: number[]) {
      state.online = ids;
    },
    setUsers(state: RootState, users: UserDictModel) {
      state.allUsersDict = users;
      storage.setUsers(Object.values(users));
    },
    setUser(state: RootState, user: UserModel) {
      state.allUsersDict[user.id].user = user.user;
      state.allUsersDict[user.id].sex = user.sex;
      storage.saveUser(user);
    },
    setUserInfo(state: RootState, userInfo: CurrentUserInfoModel) {
      state.userInfo = userInfo;
      storage.setUserProfile(userInfo);
    },
    setUserSettings(state: RootState, userInfo: CurrentUserSettingsModel) {
      state.userSettings = userInfo;
      storage.setUserSettings(userInfo);
    },
    setUserImage(state: RootState, userImage: string) {
      state.userImage = userImage;
    },
    setRooms(state: RootState, rooms: RoomDictModel) {
      state.roomsDict = rooms;
      storage.setRooms(Object.values(rooms));
    },
    init(state: RootState, setRooms: SetRooms) {
      state.roomsDict = setRooms.roomsDict;
      state.userInfo = setRooms.profile;
      state.userSettings = setRooms.settings;
      state.allUsersDict = setRooms.allUsersDict;
    },
    addRoom(state: RootState, room: RoomModel) {
      Vue.set(state.roomsDict, String(room.id), room);
      storage.saveRoom(room);
    },
    logout(state: RootState) {
      state.userInfo = null;
      state.userSettings = null;
      state.userImage = null;
      state.roomsDict = {};
      state.allUsersDict = {};
      state.activeUserId = null;
      state.online = [];
      state.activeRoomId = null;
      state.editedMessage = null;
      storage.clearStorage();
    }
  },
  actions: {
    growlErrorRaw(context: State, html) {
      let growl: GrowlModel = {id: Date.now(), html, type: GrowlType.ERROR};
      context.commit('addGrowl', growl);
      setTimeout(() => {
        context.commit('removeGrowl', growl);
      }, 4000);
    },
    growlError(context: State, title) {
      let growl: GrowlModel = {id: Date.now(), html: encodeHTML(title), type: GrowlType.ERROR};
      context.commit('addGrowl', growl);
      setTimeout(() => {
        context.commit('removeGrowl', growl);
      }, 4000);
    },
    growlInfo(context: State, title) {
      let growl: GrowlModel = {id: Date.now(), html: encodeHTML(title), type: GrowlType.INFO};
      context.commit('addGrowl', growl);
      setTimeout(() => {
        context.commit('removeGrowl', growl);
      }, 4000);
    },
    growlSuccess(context: State, title) {
      let growl: GrowlModel = {id: Date.now(), html: encodeHTML(title), type: GrowlType.SUCCESS};
      context.commit('addGrowl', growl);
      setTimeout(() => {
        context.commit('removeGrowl', growl);
      }, 4000);
    },
  },
};


export default new Vuex.Store<RootState>(store);