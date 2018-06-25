import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import {ActionContext} from 'vuex/types';

Vue.use(Vuex);

import loggerFactory from './utils/loggerFactory';
import {
  CurrentUserInfoModel,
  EditingMessage,
  GrowlModel,
  GrowlType,
  MessageModel, RoomDictModel,
  RoomModel, RoomSettingsModel,
  RootState, UserDictModel,
  UserModel
} from './types/model';
import {AddMessagePayload, MessagesLocation, SearchedMessagesIds, SetRoomsUsers, SetSearchTo} from './types/types';
import {getMessageById} from './utils/utils';

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
      logger.log('privateRooms {}', res)();
      return res;
    },
    roomsArray(state: RootState): RoomModel[] {
      let anies = Object.values(state.roomsDict);
      logger.log('roomsArray {}', anies)();
      return anies;
    },
    publicRooms(state: RootState, getters): RoomModel[] {
      let roomModels: RoomModel[] = getters.roomsArray.filter(r => r.name);
      logger.log('publicRooms {} ', roomModels)();
      return roomModels;
    },
    usersArray(state: RootState): UserModel[] {
      let res: UserModel[] = Object.values(state.allUsersDict);
      logger.log('usersArray {}', res)();
      return res;
    },
    maxId(state: RootState): SingleParamCB<number> {
      return (id: number) => {
        let messages = state.roomsDict[id].messages;
        return messages.length > 0 ? messages[0].id : null;
      };
    },
    activeRoom(state: RootState): RoomModel {
      return state.roomsDict[state.activeRoomId];
    },
    minId(state: RootState): SingleParamCB<number> {
      return (id: number) => {
        let messages = state.roomsDict[id].messages;
        return messages.length > 0 ? messages[messages.length - 1].id : null;
      };
    },
    activeUser(state: RootState): UserModel {
      return state.allUsersDict[state.activeUserId];
    },
    showNav(state: RootState) {
      return !state.editedMessage && !state.activeUserId;
    },
    editingMessageModel(state: RootState): MessageModel {
      logger.log('Eval editingMessageModel')();
      if (state.editedMessage) {
        return getMessageById(state, state.editedMessage.roomId, state.editedMessage.messageId);
      } else {
        return null;
      }
    }
  },
  mutations: {
    setEditedMessage(state: RootState, editedMessage: EditingMessage) {
      state.editedMessage = editedMessage;
      state.activeUserId = null;
    },
    setSearchTo(state: RootState, payload: SetSearchTo) {
      state.roomsDict[payload.roomId].searchActive = payload.searchActive;
    },
    setActiveUserId(state: RootState, activeUserId: number) {
      state.activeUserId = activeUserId;
      state.editedMessage = null;
    },
    addMessages(state: RootState, ml: MessagesLocation) {
      let om: MessageModel[] = state.roomsDict[ml.roomId].messages;
      om.push(...ml.messages);
      om.sort((a, b) => a.time > b.time ? 1 : a.time < b.time ? -1 : 0);
    },
    setSearchedIds(state: RootState, smi: SearchedMessagesIds) {
      state.roomsDict[smi.roomId].searchedIds = smi.messagesIds;
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
    addMessage(state: RootState, m: AddMessagePayload) {
      state.roomsDict[m.message.roomId].messages.splice(m.index, 0, m.message);
    },
    deleteMessage(state: RootState, rm: MessageModel) {
      let m: MessageModel =  getMessageById(state, rm.roomId, rm.id);
      Object.assign(m, rm);
    },
    editMessage(state: RootState, rm: MessageModel) {
      let message = getMessageById(state, rm.roomId, rm.id);
      Object.assign(message, rm);
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
    setUserInfo(state: RootState, userInfo: CurrentUserInfoModel) {
      state.userInfo = userInfo;
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