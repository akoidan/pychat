import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import {ActionContext} from 'vuex/types';

Vue.use(Vuex);
import {
  CurrentUserInfo,
  GrowlModel,
  GrowlType,
  MessageDb,
  MessageModel,
  RoomModel,
  RootState,
  UserModel
} from './types';
import {globalLogger} from './utils/singletons';

interface State extends ActionContext<RootState, RootState> {}

interface IaddMessage {
  roomId: number;
  message: MessageModel;
}

const store: StoreOptions<RootState> = {
  state: {
    isOnline: true,
    growls: [],
    allUsers: {},
    theme: 'color-reg',
    regHeader: null,
    rooms: {},
    userInfo: null,
    online: [],
    activeRoomId: 1,
    editedMessageid: null
  },
  getters: {
    maxId(state) {
      return id => state.rooms[id].messages.length > 0 ? state.rooms[id].messages[0].id : null;
    },
    minId(state) {
      return id => state.rooms[id].messages.length > 0 ? state.rooms[id].messages[this.room.messages.length - 1].id : null;
    },
  },
  mutations: {
    setMessages(state: RootState, {messages, roomId}) {
      state.rooms[roomId].messages = messages;
    },
    addMessage(state: RootState, rm: IaddMessage) {
      globalLogger.log('Adding message to storage {}', rm)();
      let room = state.rooms[rm.roomId];
      let i = 0;
      for (; i < room.messages.length; i++) {
        if (room.messages[i].time > rm.message.time) {
          break;
        }
      }
      room.messages.splice(i, 0, rm.message);
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
    addUser(state: RootState, {userId, user, sex}) {
      state.allUsers[userId] = {sex, user};
    },
    setOnline(state: RootState, ids: number[]) {
      state.online = ids;
    },
    setUsers(state: RootState, users: { [id: number]: UserModel }) {
      state.allUsers = users;
    },
    setUserInfo(state: RootState, userInfo: CurrentUserInfo) {
      state.userInfo = userInfo;
    },
    setRooms(state: RootState, rooms: {[id: string]: RoomModel}) {
      state.rooms = rooms;
    },
    setAllLoaded(state: RootState, roomId: number) {
      state.rooms[roomId].allLoaded = true;
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
    setOnline(context: State) {
      context.commit('setIsOnline', true);
    },
    setOffline(context: State) {
      context.commit('setIsOnline', false);
    }
  }
};


export default new Vuex.Store<RootState>(store);