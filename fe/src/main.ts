import Vue from 'vue';

import App from './components/App.vue';
import {api, storage, ws} from './utils/singletons';
import store from './store';
import router from './router';


// window.addEventListener('DOMContentLoaded', () => {

  window.addEventListener('focus', () => {
    if (store.state.userInfo && ws.isWsOpen()) {
      // ws.pingServer();
    }
  });
  store.watch(s => s.userInfo && s.userInfo.theme || 'color-reg', (v, o) => {
    document.body.parentElement.className = v;
  });

  window.onerror = function (msg, url, linenumber, column, errorObj) {
    let message = `Error occurred in ${url}:${linenumber}\n${msg}`;
    if (!!store.state.userInfo || store.state.userInfo.sendLogs) {
      api.sendLogs(`${url}:${linenumber}:${column || '?'}\n${msg}\n\nOBJ:  ${errorObj || '?'}`);
    }
    store.dispatch('growlError', message);
    return false;
  };

  document.addEventListener('DOMContentLoaded', function () {
    storage.connect(finished => {
      new Vue({
        router,
        store,
        render: h => h(App)
      }).$mount('#app');
    });
  });
// });
