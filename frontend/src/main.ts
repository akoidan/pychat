import '@/utils/classComponentHooks.ts';
import '@/assets/sass/common.sass';
import {
  api,
  channelsHandler,
  globalLogger,
  storage,
  webrtcApi,
  isMobile,
  ws,
  xhr
} from '@/utils/singletons';
import router from '@/utils/router';
import * as constants from '@/utils/consts';
import {GIT_HASH, IS_DEBUG, IS_ANDROID} from '@/utils/consts';
import {initStore} from '@/utils/utils';
import App from '@/components/App.vue'; // should be after initStore
import {sub} from '@/utils/sub';
import Vue from 'vue';
import {declareDirectives, declareMixins} from '@/utils/vuehelpers';

Vue.prototype.$api = api;
Vue.prototype.$ws = ws;
declareMixins();
declareDirectives();

initStore().then(value => {
  globalLogger.debug('Exiting from initing store')();
}).catch(e => {
  globalLogger.error('Unable to init store from db, because of', e)();
});

export function init() {
  document.body.addEventListener('drop', e => e.preventDefault());
  document.body.addEventListener('dragover', e => e.preventDefault());
  const vue: Vue = new Vue({router, render: (h: Function): typeof Vue.prototype.$createElement => h(App)});
  vue.$mount('#app');

  window.GIT_VERSION = GIT_HASH;
  if (IS_DEBUG) {
    window.vue = vue;
    window.channelsHandler = channelsHandler;
    window.ws = ws;
    window.api = api;
    window.xhr = xhr;
    window.storage = storage;
    window.webrtcApi = webrtcApi;
    window.sub = sub;
    window.consts = constants;
    globalLogger.log('Constants {}', constants)();
  }

}

if (document.readyState !== 'loading') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}
