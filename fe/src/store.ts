import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import {ActionContext} from 'vuex/types';

Vue.use(Vuex);

import loggerFactory from './utils/loggerFactory';
import {
  CurrentUserInfoModel, CurrentUserSettingsModel,
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
  AddMessagePayload,
  MessagesLocation, RemoveMessageProgress, RemoveSendingMessage,
  SetMessageProgress, SetMessageProgressError,
  SetRoomsUsers,
  SetSearchTo
} from './types/types';

interface State extends ActionContext<RootState, RootState> {}

const logger = loggerFactory.getLoggerColor('store', '#6a6400');


const store: StoreOptions<RootState> = {
  state: {
    isOnline: true,
    growls: [],
    allUsersDict: {},
    regHeader: null,
    roomsDict: {},
    activeUserId: null,
    userInfo: null,
    userSettings: null,
    userImage: null,
    online: [],
    activeRoomId: null,
    editedMessage: null,
  },
  getters: {
    privateRooms(state: RootState, getters): { [id: string]: UserModel } {
      let ud: UserDictModel = state.allUsersDict;
      let res: { [id: string]: UserModel } = {};
      if (state.userInfo) {
        let myId: number = state.userInfo.userId;
        getters.roomsArray
            .filter((r: RoomModel) => !r.name)
            .forEach((r: RoomModel) => {
              let id = myId === r.users[0] ? r.users[1] : r.users[0];
              res[r.id] = ud[id];
            });
      }
      logger.debug('privateRooms {}', res)();
      return res;
    },
    roomsArray(state: RootState): RoomModel[] {
      let anies = Object.values(state.roomsDict);
      logger.debug('roomsArray {}', anies)();
      return anies;
    },
    publicRooms(state: RootState, getters): RoomModel[] {
      let roomModels: RoomModel[] = getters.roomsArray.filter(r => r.name);
      logger.debug('publicRooms {} ', roomModels)();
      return roomModels;
    },
    usersArray(state: RootState): UserModel[] {
      let res: UserModel[] = Object.values(state.allUsersDict);
      logger.debug('usersArray {}', res)();
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
        return maxId;
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
      logger.debug('Eval editingMessageModel')();
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
    },
    deleteMessage(state: RootState, rm: RemoveSendingMessage) {
      let a = 'delete';
      Vue[a](state.roomsDict[rm.roomId].messages, rm.messageId);
    },
    editMessage(state: RootState, rm: MessageModel) {
      Object.assign(state.roomsDict[rm.roomId].messages[rm.id], rm);
    },
    addMessages(state: RootState, ml: MessagesLocation) {
      let om: { [id: number]: MessageModel } = state.roomsDict[ml.roomId].messages;
      ml.messages.forEach(m => {
        let a = 'set';
        Vue[a](om, m.id, m);
      });
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
    },
    deleteRoom(state: RootState, roomId: number) {
      let a = 'delete'; // TODO
      Vue[a](state.roomsDict, roomId);
    },
    setRoomsUsers(state: RootState, ru: SetRoomsUsers) {
      state.roomsDict[ru.roomId].users = ru.users;
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
    },
    setRegHeader(state: RootState, regHeader: string) {
      state.regHeader = regHeader;
    },
    addUser(state: RootState, u: UserModel) {
      let newVar = 'set';
      Vue[newVar](state.allUsersDict, u.id, u);
    },
    setOnline(state: RootState, ids: number[]) {
      state.online = ids;
    },
    setUsers(state: RootState, users: UserDictModel) {
      state.allUsersDict = users;
    },
    setUser(state: RootState, user: UserModel) {
      state.allUsersDict[user.id].user = user.user;
      state.allUsersDict[user.id].sex = user.sex;
    },
    setUserInfo(state: RootState, userInfo: CurrentUserInfoModel) {
      state.userInfo = userInfo;
    },
    setUserSettings(state: RootState, userInfo: CurrentUserSettingsModel) {
      state.userSettings = userInfo;
    },
    setUserImage(state: RootState, userImage: string) {
      state.userImage = userImage;
    },
    setRooms(state: RootState, rooms: RoomDictModel) {
      state.roomsDict = rooms;
    },
    addRoom(state: RootState, room: RoomModel) {
      let newVar = 'set';
      Vue[newVar](state.roomsDict, room.id, room);
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
    logout(context: State) {
      context.commit('setUserInfo', null);
      context.commit('setEditedMessage', null);
      context.commit('setRooms', {});
    }
  },
};


export default new Vuex.Store<RootState>(store);