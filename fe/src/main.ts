import Vue from 'vue';

import App from './components/App.vue';
import {api, globalLogger, storage, ws, xhr} from './utils/singletons';
import store from './store';
import router from './router';


window.addEventListener('focus', ws.pingServer.bind(ws));

window.onerror = function (msg, url, linenumber, column, errorObj) {
  let message = `Error occurred in ${url}:${linenumber}\n${msg}`;
  if (!!this.store.state.userInfo || this.store.state.userInfo.sendLogs) {
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
