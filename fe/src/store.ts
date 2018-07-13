import Vue from 'vue';
import Vuex, {StoreOptions} from 'vuex';
import {ActionContext} from 'vuex/types';
import loggerFactory from './utils/loggerFactory';
import {
  ChangeOnline,
  CurrentUserInfoModel,
  CurrentUserSettingsModel,
  EditingMessage,
  GrowlModel,
  GrowlType,
  MessageModel,
  RoomDictModel,
  RoomModel,
  RoomSettingsModel,
  RootState,
  UserDictModel,
  UserModel
} from './types/model';
import {
  ChangeOnlineEntry,
  MessagesLocation, PrivateRoomsIds,
  RemoveMessageProgress,
  RemoveSendingMessage,
  SetMessageProgress,
  SetMessageProgressError,
  SetRoomsUsers,
  SetSearchTo,
  SetUploadProgress
} from './types/types';
import {storage} from './utils/singletons';
import {SetRooms} from './types/dto';

Vue.use(Vuex);

interface State extends ActionContext<RootState, RootState> {}

const logger = loggerFactory.getLoggerColor('store', '#6a6400');


const store: StoreOptions<RootState> = {
  state: {
    isOnline: false,
    growls: [],
    allUsersDict: {},
    regHeader: null,
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
      let upload = state.roomsDict[payload.roomId].messages[payload.messageId].upload;
      upload.uploaded = payload.uploaded;
      upload.total = payload.total;
    },
    setDim(state: RootState, payload: boolean) {
      state.dim = payload;
    },
    incNewMessagesCount(state: RootState, roomId: number) {
      state.roomsDict[roomId].newMessagesCount++;
    },
    resetNewMessagesCount(state: RootState, roomId: number) {
      state.roomsDict[roomId].newMessagesCount = 0;
    },
    setUploadProgress(state: RootState, payload: SetUploadProgress) {
      state.roomsDict[payload.roomId].messages[payload.messageId].upload = payload.upload;
    },
    removeMessageProgress(state: RootState, payload: RemoveMessageProgress) {
      let message: MessageModel = state.roomsDict[payload.roomId].messages[payload.messageId];
      message.upload  = null;
    },
    setMessageProgressError(state: RootState, payload: SetMessageProgressError) {
      let upload = state.roomsDict[payload.roomId].messages[payload.messageId].upload;
      upload.error = payload.error;
    },
    addMessage(state: RootState, m: MessageModel) {
      let om: { [id: number]: MessageModel } = state.roomsDict[m.roomId].messages;
      let a = 'set';
      Vue[a](om, m.id, m);
      storage.saveMessage(m);
    },
    deleteMessage(state: RootState, rm: RemoveSendingMessage) {
      let a = 'delete';
      Vue[a](state.roomsDict[rm.roomId].messages, rm.messageId);
      storage.deleteMessage(rm.messageId);
    },
    addMessages(state: RootState, ml: MessagesLocation) {
      let om: { [id: number]: MessageModel } = state.roomsDict[ml.roomId].messages;
      ml.messages.forEach(m => {
        let a = 'set';
        Vue[a](om, m.id, m);
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
    deleteRoom(state: RootState, roomId: number) {
      let a = 'delete'; // TODO
      Vue[a](state.roomsDict, roomId);
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
      let newVar = 'set';
      Vue[newVar](state.allUsersDict, u.id, u);
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
      let newVar = 'set';
      Vue[newVar](state.roomsDict, room.id, room);
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
    growlError(context: State, title) {
      let growl: GrowlModel = {id: Date.now(), title, type: GrowlType.ERROR};
      context.commit('addGrowl', growl);
      setTimeout(f => {
        context.commit('removeGrowl', growl);
      }, 4000);
    },
    growlInfo(context: State, title) {
      let growl: GrowlModel = {id: Date.now(), title, type: GrowlType.INFO};
      context.commit('addGrowl', growl);
      setTimeout(f => {
        context.commit('removeGrowl', growl);
      }, 4000);
    },
    growlSuccess(context: State, title) {
      let growl: GrowlModel = {id: Date.now(), title, type: GrowlType.SUCCESS};
      context.commit('addGrowl', growl);
      setTimeout(f => {
        context.commit('removeGrowl', growl);
      }, 4000);
    },
  },
};


export default new Vuex.Store<RootState>(store);