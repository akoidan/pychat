import '@/ts/utils/classComponentHooks.ts';
import '@/assets/sass/common.sass';
import * as constants from '@/ts/utils/consts';

import * as runtimeConsts from '@/ts/utils/runtimeConsts';
import {
  browserVersion,
  isChrome,
  isMobile,
  WS_API_URL
} from '@/ts/utils/runtimeConsts';
import App from '@/vue/App.vue'; // should be after initStore
import { sub } from '@/ts/instances/subInstance';
import {
  ComponentOptions,
  createApp
} from 'vue';
import { store } from '@/ts/instances/storeInstance';
import { Logger } from 'lines-logger';
import loggerFactory from '@/ts/instances/loggerFactory';
import sessionHolder from '@/ts/instances/sessionInstance';
import type { App as VueApp } from '@vue/runtime-core'
import {
  MessageModel,
  PlatformUtil,
  RoomModel
} from '@/ts/types/model';
import Xhr from '@/ts/classes/Xhr';
import '@/assets/icon.png';
import WsHandler from '@/ts/message_handlers/WsHandler';
import WsMessageHandler from '@/ts/message_handlers/WsMessageHandler';
import DatabaseWrapper from '@/ts/classes/DatabaseWrapper';
import LocalStorage from '@/ts/classes/LocalStorage';
import Api from '@/ts/message_handlers/Api';
import NotifierHandler from '@/ts/classes/NotificationHandler';
import Http from '@/ts/classes/Http';
import WebRtcApi from '@/ts/webrtc/WebRtcApi';
import { router } from '@/ts/instances/routerInstance';
import { AudioPlayer } from '@/ts/classes/AudioPlayer';
import { AndroidPlatformUtil } from '@/ts/devices/AndroidPlatformUtils';
import { WebPlatformUtils } from '@/ts/devices/WebPlatformUtils';
import { MessageSenderProxy } from '@/ts/message_handlers/MessageSenderProxy';
import { MessageHelper } from '@/ts/message_handlers/MessageHelper';
import { RoomHandler } from '@/ts/message_handlers/RomHandler';
import { mainWindow } from '@/ts/instances/mainWindow';
import mitt, { Emitter } from 'mitt';
import { vueStore } from '@/ts/classes/DefaultStore';
import { loggerMixin } from '@/ts/utils/mixins';
import {
  switchDirective,
  validityDirective
} from '@/ts/utils/directives';


const logger: Logger = loggerFactory.getLoggerColor(`main`, '#007a70');
logger.log(`Evaluating main script ${constants.GIT_HASH}`)();

async function init() {
  document.body.addEventListener('drop', e => e.preventDefault());
  document.body.addEventListener('dragover', e => e.preventDefault());

  const xhr: Http = /* window.fetch ? new Fetch(XHR_API_URL, sessionHolder) :*/ new Xhr(sessionHolder);
  const api: Api = new Api(xhr);

  let storage;
  try {
    storage = new DatabaseWrapper(mainWindow);
  } catch (e) {
    logger.error("Unable to init websql, because {}. Falling back to localstorage", e)();
    storage = new LocalStorage();
  }

  const audioPlayer: AudioPlayer = new AudioPlayer(mainWindow);
  store.setStorage(storage);
  const ws: WsHandler = new WsHandler(WS_API_URL, sessionHolder, store);
  const notifier: NotifierHandler = new NotifierHandler(api, browserVersion, isChrome, isMobile, ws, store, mainWindow);
  const messageBus: Emitter<any> = mitt();
  const messageHelper: MessageHelper = new MessageHelper(store, notifier, messageBus, audioPlayer);
  const wsMessageHandler: WsMessageHandler = new WsMessageHandler(store, api, ws, messageHelper);
  const roomHandler: RoomHandler = new RoomHandler(store, api, ws, audioPlayer);
  const webrtcApi: WebRtcApi = new WebRtcApi(ws, store, notifier, messageHelper);
  const platformUtil: PlatformUtil = constants.IS_ANDROID ? new AndroidPlatformUtil() : new WebPlatformUtils();
  const messageSenderProxy: MessageSenderProxy = new MessageSenderProxy(store, webrtcApi, wsMessageHandler);

  const vue: VueApp = createApp(App,  {
    store: vueStore,
  });
  vue.mixin(loggerMixin);
  vue.use(router);
  vue.directive('switcher', switchDirective);
  vue.directive('validity', validityDirective);
  vue.config.globalProperties.$messageBus = messageBus;
  vue.config.globalProperties.$api = api;
  vue.config.globalProperties.$ws = ws;
  vue.config.globalProperties.$store = store;
  vue.config.globalProperties.$webrtcApi = webrtcApi;
  vue.config.globalProperties.$platformUtil = platformUtil;
  vue.config.globalProperties.$messageSenderProxy = messageSenderProxy;
  vue.config.errorHandler = (err, vm, info) => {
    const message = `Error occurred in ${vm?.$options?.__file}:${err}:\n${info}`;
    if (store?.userSettings?.sendLogs && api) {
      api.sendLogs(`${vm?.$options?.__file}:${err}:${info}`, browserVersion, constants.GIT_HASH);
    }
    store.growlError(message);
    logger.error("Error occurred in vue component err: '{}', vm '{}', info '{}'", err, vm, info)()
    return false;
  };

  vue.mount(document.body);

  window.onerror = function (msg, url, linenumber, column, errorObj) {
    const message = `Error occurred in ${url}:${linenumber}\n${msg}`;
    if (store?.userSettings?.sendLogs && api) {
      api.sendLogs(`${url}:${linenumber}:${column || '?'}\n${msg}\n\nOBJ:  ${errorObj || '?'}`, browserVersion, constants.GIT_HASH);
    }
    store.growlError(message);

    return false;
  };


  window.GIT_VERSION = constants.GIT_HASH;
  if (constants.IS_DEBUG) {
    window.vue = vue;
    window.wsMessageHandler = wsMessageHandler;
    window.roomHandler = roomHandler;
    window.ws = ws;
    window.api = api;
    window.xhr = xhr;
    window.storage = storage;
    window.webrtcApi = webrtcApi;
    window.sub = sub;
    window.consts = constants;
    window.store = store;
    window.runtimeConsts = runtimeConsts;
    logger.log('Constants {}', constants)();
  }

  // sync is not required here, I tested every time this code branch is executed messages sync even if we don't use it here.
  // weird ha? they could be not in the storage ...
  // if (ws.isWsOpen()) {
  //   logger.error("Init ws open")();
  //   // channelsHandler.syncMessages();
  //   // webrtcApi.initAndSyncMessages()
  // }

}

if (document.readyState !== 'loading') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}
