import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
Vue.use(Vuex);
import {GrowlModel, GrowlType, RootState} from './types';

const store: StoreOptions<RootState> = {
  state: {
    isOnline: true,
    growls: [],
    theme: 'color-reg',
    regHeader: null,
    userInfo: null,
    sessionId: localStorage.getItem('session_id'), // TODO mock?
  },
  mutations: {
    setIsOnline (state, isOnline: boolean) {
      state.isOnline = isOnline;
    },
    addGrowl (state, growlModel: GrowlModel) {
      state.growls.push(growlModel);
    },
    removeGrowl (state, growlModel: GrowlModel) {
      let index = state.growls.indexOf(growlModel, 0);
      if (index > -1) {
        state.growls.splice(index, 1);
      }
    },
    setRegHeader (state, regHeader: string) {
      state.regHeader = regHeader;
    },
    setSessionId(state, sessionId: string) {
      state.sessionId = sessionId;
      localStorage.setItem('session_id', sessionId);
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