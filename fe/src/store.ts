import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
Vue.use(Vuex);


const store: StoreOptions<RootState> = {
  state: {
    isOnline: true,
    growls: [],
    theme: 'color-reg',
    regHeader: null
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
  },
  actions: {
    addGrowl(context, title) {
      let growl: GrowlModel = {id: Date.now(), title};
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