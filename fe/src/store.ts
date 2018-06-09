import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
Vue.use(Vuex);


const store: StoreOptions<RootState> = {
  state: {
    isOnline: true,
    growls: [],
  },
  mutations: {
    setIsOnline (state, isOnline: boolean) {
      state.isOnline = isOnline;
    },
    addGrowl (state, text: string) {
      state.growls.push(text);
    },
    removeGrowl (state, text: string) {
      let index = state.growls.indexOf(text, 0);
      if (index > -1) {
        state.growls.splice(index, 1);
      }
    },
  },
  actions: {
    addGrowl(context, text) {
      context.commit('addGrowl', text);
      setTimeout(f => {
        context.commit('removeGrowl', text);
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