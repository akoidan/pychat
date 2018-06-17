import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
Vue.use(Vuex);
import {CurrentUserInfo, GrowlModel, GrowlType, RoomModel, RootState, UserModel} from './types';

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
  },
  mutations: {
    setIsOnline(state, isOnline: boolean) {
      state.isOnline = isOnline;
    },
    addGrowl(state, growlModel: GrowlModel) {
      state.growls.push(growlModel);
    },
    removeGrowl(state, growlModel: GrowlModel) {
      let index = state.growls.indexOf(growlModel, 0);
      if (index > -1) {
        state.growls.splice(index, 1);
      }
    },
    setActiveRoomId(state, id: number) {
      state.activeRoomId = id;
    },
    setRegHeader(state, regHeader: string) {
      state.regHeader = regHeader;
    },
    addUser(state, {userId, user, sex}) {
      state.allUsers[userId] = {sex, user};
    },
    setOnline(state, ids: number[]) {
      state.online = ids;
    },
    setUsers(state, users: { [id: number]: UserModel }) {
      state.allUsers = users;
    },
    setUserInfo(state, userInfo: CurrentUserInfo) {
      state.userInfo = userInfo;
    },
    setRooms(state, rooms: {[id: string]: RoomModel}) {
      state.rooms = rooms;
    }
  },
  actions: {
    growlError(context, title) {
      let growl: GrowlModel = {id: Date.now(), title, type: GrowlType.ERROR};
      context.commit('addGrowl', growl);
      setTimeout(f => {
        context.commit('removeGrowl', growl);
      }, 4000);
    },
    growlInfo(context, title) {
      let growl: GrowlModel = {id: Date.now(), title, type: GrowlType.INFO};
      context.commit('addGrowl', growl);
      setTimeout(f => {
        context.commit('removeGrowl', growl);
      }, 4000);
    },
    growlSuccess(context, title) {
      let growl: GrowlModel = {id: Date.now(), title, type: GrowlType.SUCCESS};
      context.commit('addGrowl', growl);
      setTimeout(f => {
        context.commit('removeGrowl', growl);
      }, 4000);
    },
    setOnline(context) {
      context.commit('setIsOnline', true);
    },
    setOffline(context) {
      context.commit('setIsOnline', false);
    }
  }
};


export default new Vuex.Store<RootState>(store);