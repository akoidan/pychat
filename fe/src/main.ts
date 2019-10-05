import '@/utils/classComponentHooks.ts';
import '@/assets/sass/common.sass';
import App from '@/components/App.vue';
import {api, browserVersion, channelsHandler, globalLogger, storage, webrtcApi, ws, xhr} from '@/utils/singletons';
import router from '@/utils/router';
import loggerFactory from '@/utils/loggerFactory';
import {GIT_HASH, IS_DEBUG} from '@/utils/consts';
import {initStore} from '@/utils/utils';
import {sub} from '@/utils/sub';
import Vue from 'vue';

import * as constants from '@/utils/consts';

if (!Object.values) Object.values = o => Object.keys(o).map(k => o[k]);

Vue.mixin({
  computed: {
    logger() {
      if (!this.__logger && this.$options['_componentTag'] !== 'router-link') {
        let name = this.$options['_componentTag'] || 'vue-comp';
        if (!this.$options['_componentTag']) {
          globalLogger.warn('Can\'t detect tag of {}', this)();
        }
        if (this.id) {
          name += `:${this.id}`;
        }
        this.__logger = loggerFactory.getLoggerColor(name, '#35495e');
      }
      return this.__logger;
    }
  },
  updated: function() {
    this.logger && this.logger.trace('Updated')();
  },
  created: function() {
    this.logger &&  this.logger.trace('Created')();
  },
});

Vue.prototype.$api = api;
Vue.prototype.$ws = ws;


initStore().then(value => {
  globalLogger.debug('Exiting from initing store')();
}).catch(e => {
  globalLogger.error('Unable to init store from db, because of', e)();
});



export function init() {
  document.body.addEventListener('drop', e => e.preventDefault());
  document.body.addEventListener('dragover', e => e.preventDefault());
  let vue = new Vue({
    router,
    render: h => h(App)
  });
  vue.$mount('#app');
  window.GIT_VERSION = GIT_HASH;
  if (IS_DEBUG) { // TODO
    window.vue = vue;
    window['channelsHandler'] = channelsHandler;
    window['ws'] = ws;
    window.api = api;
    window['xhr'] = xhr;
    window['storage'] = storage;
    window['webrtcApi'] = webrtcApi;
    window['sub'] = sub;
    window['consts'] = constants;
    globalLogger.log('Constants {}', constants)();
  }

}

if (document.readyState !== 'loading') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}
