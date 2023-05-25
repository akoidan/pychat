import "@/assets/sass/common.sass";
import * as constants from "@/ts/utils/consts";

import * as runtimeConsts from "@/ts/utils/runtimeConsts";
import {
  browserVersion,
  isChrome,
  isMobile,
  WS_API_URL,
} from "@/ts/utils/runtimeConsts";
// Should be after initStore
import App from "@/vue/App.vue";
import {createApp} from "vue";
import {store} from "@/ts/instances/storeInstance";
import type {Logger} from "lines-logger";
import loggerFactory from "@/ts/instances/loggerFactory";
import sessionHolder from "@/ts/instances/sessionInstance";
import type {App as VueApp} from "@vue/runtime-core";
import type {PlatformUtil} from "@/ts/types/model";
import Xhr from "@/ts/classes/Xhr";
import "@/assets/icon.png"; // eslint-disable-line import/no-unassigned-import
import WsHandler from "@/ts/message_handlers/WsHandler";
import WsMessageHandler from "@/ts/message_handlers/WsMessageHandler";
import DatabaseWrapper from "@/ts/classes/DatabaseWrapper";
import LocalStorage from "@/ts/classes/LocalStorage";
import Api from "@/ts/message_handlers/Api";
import NotifierHandler from "@/ts/classes/NotificationHandler";
import type Http from "@/ts/classes/Http";
import WebRtcApi from "@/ts/webrtc/WebRtcApi";
import {routerFactory} from "@/ts/instances/routerInstance";
import {AudioPlayer} from "@/ts/classes/AudioPlayer";
import {AndroidPlatformUtil} from "@/ts/devices/AndroidPlatformUtils";
import {WebPlatformUtils} from "@/ts/devices/WebPlatformUtils";
import {MessageSenderProxy} from "@/ts/message_handlers/MessageSenderProxy";
import {MessageHelper} from "@/ts/message_handlers/MessageHelper";
import {RoomHandler} from "@/ts/message_handlers/RomHandler";
import {mainWindow} from "@/ts/instances/mainWindow";
import {SmileysApi} from "@/ts/utils/smileys";
import {loggerMixin} from "@/ts/utils/mixins";
import {
  switchDirective,
  validityDirective,
} from "@/ts/utils/directives";
import Subscription from "@/ts/classes/Subscription";
import type {Router} from "vue-router";


const logger: Logger = loggerFactory.getLoggerColor("main", "#007a70");
logger.log(`Evaluating main script ${constants.GIT_HASH}`)();


// eslint-disable-next-line max-params
function bootstrapVue(
  messageBus: Subscription,
  api: Api,
  ws: WsHandler,
  webrtcApi: WebRtcApi,
  platformUtil: PlatformUtil,
  messageSenderProxy: MessageSenderProxy,
  smileyApi: SmileysApi,
  router: Router,
): VueApp {
  const vue: VueApp = createApp(App);
  vue.mixin(loggerMixin);
  vue.use(router);
  vue.directive("switcher", switchDirective);
  vue.directive("validity", validityDirective);
  vue.config.globalProperties.$messageBus = messageBus;
  vue.config.globalProperties.$api = api;
  vue.config.globalProperties.$ws = ws;
  vue.config.globalProperties.$store = store;
  vue.config.globalProperties.$webrtcApi = webrtcApi;
  vue.config.globalProperties.$platformUtil = platformUtil;
  vue.config.globalProperties.$messageSenderProxy = messageSenderProxy;
  vue.config.globalProperties.$smileyApi = smileyApi;
  vue.config.errorHandler = (err, vm, info): boolean => {
    /* eslint-disable
     @typescript-eslint/restrict-template-expressions,
     @typescript-eslint/restrict-template-expressions,
     no-underscore-dangle
     */
    const message = `Error occurred in ${vm?.$options?.__file}:${err}:\n${info}`;
    if (store?.userSettings?.sendLogs && api) {
      void api.sendLogs(`${vm?.$options?.__file}:${err}:${info}`, browserVersion, constants.GIT_HASH);
    }
    /* eslint-enable
     @typescript-eslint/restrict-template-expressions,
     @typescript-eslint/restrict-template-expressions,
     no-underscore-dangle
     */
    logger.error("Error occurred in vue component err: '{}', vm '{}', info '{}'", err, vm, info)();
    if (store?.userSettings?.logs != "disable") {
      void store.growlError(message);
    }
    return false;
  };
  return vue;
}

// eslint-disable-next-line max-lines-per-function, max-statements
function init(): void {

  /**
   *  Hotfix for Edge 15 for reflect data
   */

  if (!window.InputEvent) {
    // @ts-expect-error: next-line
    window.InputEvent = (): void => {
    };
  }

  document.body.addEventListener("drop", (event) => {
    event.preventDefault();
  });
  document.body.addEventListener("dragover", (event) => {
    event.preventDefault();
  });

  const sub = new Subscription();
  const xhr: Http = /* Window.fetch ? new Fetch(XHR_API_URL, sessionHolder) :*/ new Xhr(sessionHolder);
  const api: Api = new Api(xhr, sub);

  let storage;
  try {
    storage = new DatabaseWrapper(mainWindow);
  } catch (event) {
    logger.error("Unable to init websql, because {}. Falling back to localstorage", event)();
    storage = new LocalStorage();
  }

  const audioPlayer: AudioPlayer = new AudioPlayer(mainWindow);
  store.setStorage(storage);
  const smileyApi = new SmileysApi(store);
  void smileyApi.init();
  const ws: WsHandler = new WsHandler(WS_API_URL, sessionHolder, store, sub);
  const notifier: NotifierHandler = new NotifierHandler(api, browserVersion, isChrome, isMobile, ws, store, mainWindow, sub);
  const messageHelper: MessageHelper = new MessageHelper(store, notifier, sub, audioPlayer);
  const wsMessageHandler: WsMessageHandler = new WsMessageHandler(store, api, ws, messageHelper, sub);
  const roomHandler: RoomHandler = new RoomHandler(store, api, ws, audioPlayer, sub);
  const webrtcApi: WebRtcApi = new WebRtcApi(ws, store, notifier, messageHelper, sub);
  const platformUtil: PlatformUtil = constants.IS_ANDROID ? new AndroidPlatformUtil() : new WebPlatformUtils();
  const messageSenderProxy: MessageSenderProxy = new MessageSenderProxy(store, webrtcApi, wsMessageHandler);
  const router = routerFactory(sub);
  const vue = bootstrapVue(sub, api, ws, webrtcApi, platformUtil, messageSenderProxy, smileyApi, router);

  vue.mount(document.body);

  window.onerror = function onerror(msg, url, linenumber, column, errorObj): boolean {
    const message = `Error occurred in ${url!}:${linenumber!}\n${JSON.stringify(msg)}`;
    if (store?.userSettings?.sendLogs && api) {
      void api.sendLogs(
        `${url!}:${linenumber!}:${column ?? "?"}\n${JSON.stringify(msg)}\n\nOBJ:  ${JSON.stringify(errorObj) ?? "?"}`,
        browserVersion,
        constants.GIT_HASH,
      );
    }
    void store.growlError(message);

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
    logger.log("Constants {}", constants)();
  }

  /*
   * Sync is not required here, I tested every time this code branch is executed messages sync even if we don't use it here.
   * weird ha? they could be not in the storage ...
   * if (ws.isWsOpen()) {
   *   logger.error("Init ws open")();
   *   // channelsHandler.syncMessages();
   *   // webrtcApi.initAndSyncMessages()
   * }
   */
}

if (!document.body) {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
