import '@/utils/classComponentHooks.ts';
import '@/assets/sass/common.sass';
import {
  api,
  channelsHandler,
  storage,
  webrtcApi,
  ws,
  xhr
} from '@/utils/singletons';
import router from '@/utils/router';
import * as constants from '@/utils/consts';
import {GIT_HASH, IS_ANDROID, IS_DEBUG} from '@/utils/consts';
import App from '@/components/App.vue'; // should be after initStore
import {sub} from '@/utils/sub';
import Vue, {ComponentOptions} from 'vue';
import {store} from '@/utils/storeHolder';
import {browserVersion, isMobile} from '@/utils/runtimeConsts';
import {Logger} from "lines-logger";
import loggerFactory from "@/utils/loggerFactory";
import {StorageData} from "@/types/types";
import sessionHolder from "@/utils/sessionHolder";
import {MessageModel, RoomModel} from "@/types/model";
import {getUniqueId} from "@/utils/pureFunctions";
import {VNode} from "vue/types/vnode";


function declareDirectives() {
  Vue.directive('validity', function (el: HTMLElement, binding) {
    (<HTMLInputElement>el).setCustomValidity(binding.value);
  });

  interface MyVNode extends VNode {
    switcherTimeout?: number;
    switcherStart?: () => Promise<void>;
    switcherFinish?: () => Promise<void>;
  }

  function getEventName(eventType: 'start' | 'end') : string[] {
    if (IS_ANDROID || isMobile) {
      return eventType === 'start' ? ['touchstart'] : ['touchend'];
    } else {
      return eventType === 'start' ? ['mousedown'] : ['mouseleave', 'mouseup'];
    }
  }

  const HOLD_TIMEOUT = 300;

  Vue.directive('switcher', {

    bind: function(el, binding, vnode: MyVNode) {

      vnode.switcherTimeout = 0;
      vnode.switcherStart = async function() {
        vnode.context!.$logger.debug("Triggered onMouseDown, waiting {}ms for the next event...", HOLD_TIMEOUT)();
        getEventName('end').forEach(eventName => el.addEventListener(eventName, vnode.switcherFinish!))
        await new Promise((resolve) => vnode.switcherTimeout = window.setTimeout(resolve, HOLD_TIMEOUT));
        vnode.switcherTimeout = 0;
        vnode.context!.$logger.debug("Timeout expired, firing enable record action")();
        await binding.value.start();

      };
      // @ts-ignore: next-line
      vnode.switcherFinish = async function(e: Event) {
        getEventName('end').forEach(eventName => el.removeEventListener(eventName, vnode.switcherFinish!))
        if (vnode.switcherTimeout) {
          vnode.context!.$logger.debug("Click event detected, firing switch recrod action")();
          clearTimeout(vnode.switcherTimeout);
          vnode.switcherTimeout = 0;
          binding.value.switch();
        } else {
          vnode.context!.$logger.debug("Release event detected, firing stop record action")();
          binding.value.stop()
        }
      }
      getEventName('start').forEach(eventName => el.addEventListener(eventName, vnode.switcherStart!))
    },
    unbind: function(el, binding, vnode: MyVNode) {
      getEventName('start').forEach(eventName => el.removeEventListener(eventName, vnode.switcherStart!))
      getEventName('end').forEach(eventName => el.removeEventListener(eventName, vnode.switcherFinish!))
    }
  });
}


declare module 'vue/types/vue' {

  interface Vue {
    __logger: Logger;
    id?: number|string;
  }
}


function declareMixins() {
  const mixin = {
    computed: {
      $logger(this: Vue): Logger  {
        if (!this.__logger && this.$options._componentTag !== 'router-link') {
          let name = this.$options._componentTag || 'vue-comp';
          if (!this.$options._componentTag) {
            // oops :(
          }
          if (this.id) {
            name += `:${this.id}`;
          }
          this.__logger = loggerFactory.getLoggerColor(name, '#35495e');
        }

        return this.__logger;
      }
    },
    updated: function (this: Vue): void {
      this.$logger && this.$logger.trace('Updated')();
    },
    created: function(this: Vue) {
      this.$logger &&  this.$logger.trace('Created')();
    }
  };
  Vue.mixin(<ComponentOptions<Vue>><unknown>mixin);
}


async function initStore(logger: Logger) {
  store.setStorage(storage); // TODO mvoe to main
  const isNew = await storage.connect();
  if (!isNew) {
    const data: StorageData | null = await storage.getAllTree();
    const session = sessionHolder.session;
    logger.log('restored state from db {}, userId: {}, session {}', data, store.userInfo && store.userInfo.userId, session)();
    if (data) {
      if (!store.userInfo && session) {
        store.setStateFromStorage(data.setRooms);
      } else {
        store.roomsArray.forEach((storeRoom: RoomModel) => {
          if (data.setRooms.roomsDict[storeRoom.id]) {
            const dbMessages: {[id: number]: MessageModel} = data.setRooms.roomsDict[storeRoom.id].messages;
            for (const dbMessagesKey in dbMessages) {
              if (!storeRoom.messages[dbMessagesKey]) {
                store.addMessage(dbMessages[dbMessagesKey]);
              }
            }
          }
        });
        logger.debug('Skipping settings state {}', data.setRooms)();
      }
      if (session) {
        logger.debug('Appending sending messages {}', data.sendingMessages)();
        data.sendingMessages.forEach((m: MessageModel) => {
          if (m.content && m.id > 0) {
            channelsHandler.sendEditMessage(m.content, m.roomId, m.id, []);
          } else if (m.content) {
            channelsHandler.sendSendMessage(m.content, m.roomId, [], getUniqueId(), m.time);
          } else if (m.id > 0) {
            channelsHandler.sendDeleteMessage(m.id, getUniqueId());
          }
        });
      } else {
        logger.debug('No pending messages found')();
      }
    }
  }
}

function init() {
  declareMixins();
  declareDirectives();
  Vue.prototype.$api = api;
  Vue.prototype.$ws = ws;
  const logger: Logger = loggerFactory.getLoggerColor('main', '#007a70');
  document.body.addEventListener('drop', e => e.preventDefault());
  document.body.addEventListener('dragover', e => e.preventDefault());
  const vue: Vue = new Vue({router, render: (h: Function): typeof Vue.prototype.$createElement => h(App)});
  vue.$mount('#app');

  window.onerror = function (msg, url, linenumber, column, errorObj) {
    const message = `Error occurred in ${url}:${linenumber}\n${msg}`;
    if (store?.userSettings?.sendLogs && api) {
      api.sendLogs(`${url}:${linenumber}:${column || '?'}\n${msg}\n\nOBJ:  ${errorObj || '?'}`, browserVersion, GIT_HASH);
    }
    store.growlError(message);

    return false;
  };


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
    logger.log('Constants {}', constants)();
  }

  initStore(logger).then(value => {
    logger.debug('Exiting from initing store')();
  }).catch(e => {
    logger.error('Unable to init store from db, because of', e)();
  });

}

if (document.readyState !== 'loading') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}
