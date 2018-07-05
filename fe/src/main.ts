import './utils/classComponentHooks.ts';
import Vue from 'vue';

import './assets/sass/common.sass';
import App from './components/App.vue';
import {api, browserVersion, channelsHandler, globalLogger, storage, ws, xhr} from './utils/singletons';
import store from './store';
import router from './router';
import loggerFactory from './utils/loggerFactory';
import {IS_DEBUG} from './utils/consts';
import sessionHolder from './utils/sessionHolder';
import {StorageData} from './types/types';
import {MessageModel} from './types/model';


store.watch(s => s.userSettings && s.userSettings.theme || 'color-reg', (v, o) => {
  document.body.parentElement.className = v;
});

if (IS_DEBUG) {
  window['channelsHandler'] = channelsHandler;
  window['ws'] = ws;
  window['api'] = api;
  window['xhr'] = xhr;
  window['storage'] = storage;
}

window.onerror = function (msg, url, linenumber, column, errorObj) {
  let message = `Error occurred in ${url}:${linenumber}\n${msg}`;
  if ((!!store.state.userSettings || store.state.userSettings.sendLogs) && api) {
    api.sendLogs(`${url}:${linenumber}:${column || '?'}\n${msg}\n\nOBJ:  ${errorObj || '?'}`, browserVersion);
  }
  store.dispatch('growlError', message);
  return false;
};

Vue.mixin({
  computed: {
    logger() {
      if (!this.__logger) {
        let name = this.$options['_componentTag'] || 'vue-comp';
        if (this.id) {
          name += `:${this.id}`;
        }
        this.__logger = loggerFactory.getLoggerColor(name, '#35495e');
      }
      return this.__logger;
    }
  },
  updated: function() {
    this.logger.debug('Updated')();
  },
  created: function() {
    this.logger.debug('Created')();
  },
});

Vue.prototype.$api = api;
Vue.prototype.$ws = ws;

async function initStore() {
  let isNew = await storage.connect();
  if (!isNew) {
    let data: StorageData = await storage.getAllTree();
    let session = sessionHolder.session;
    globalLogger.log('restored state from db {}, userId: {}, session {}', data, store.state.userInfo && store.state.userInfo.userId, session)();
    if (data) {
      if (!store.state.userInfo && session) {
        store.commit('init', data.setRooms);
      } else {
        globalLogger.debug('Skipping settings state {}', data.setRooms)();
      }
      if (session) {
        globalLogger.debug('Appending sending messages {}', data.sendingMessages)();
        data.sendingMessages.forEach((m: MessageModel) => {
          if (m.content && m.id > 0) {
            channelsHandler.sendEditMessage(m.content, m.roomId, m.id, []);
          } else if (m.content) {
            channelsHandler.sendSendMessage(m.content, m.roomId, [], ws.getMessageId(), m.time);
          } else if (m.id > 0) {
            channelsHandler.sendDeleteMessage(m.id, ws.getMessageId());
          }
        });
      } else {
        globalLogger.debug('No pending messages found')();
      }
    }
  }
}

initStore().then(value => {
  globalLogger.debug('Exiting from initing store')();
}).catch(e => {
  globalLogger.error('Unable to init store from db, because of', e)();
});


document.addEventListener('DOMContentLoaded', function () {
  document.body.addEventListener('drop', e => e.preventDefault());
  document.body.addEventListener('dragover', e => e.preventDefault());
  let vue = new Vue({
    router,
    store,
    render: h => h(App)
  });
  vue.$mount('#app');
  if (IS_DEBUG) {
    window['vue'] = vue;
  }
});
