import Xhr from '@/utils/Xhr';
import WsHandler from '@/utils/WsHandler';
import ChannelsHandler from '@/utils/ChannelsHandler';
import DatabaseWrapper from '@/utils/DatabaseWrapper';
import mobile from 'is-mobile';
import LocalStorage from '@/utils/LocalStorage';

import Api from '@/utils/api';
import {IStorage} from '@/types/types';
import loggerFactory from '@/utils/loggerFactory';
import sessionHolder from '@/utils/sessionHolder';
import {Logger} from 'lines-logger';
import {WS_API_URL, GIT_HASH} from '@/utils/consts';
import NotifierHandler from '@/utils/NotificationHandler';
import Vue from 'vue';
import Http from '@/utils/Http';
import WebRtcApi from '@/webrtc/WebRtcApi';
import {store} from '@/utils/storeHolder';

export const xhr: Http = /* window.fetch ? new Fetch(XHR_API_URL, sessionHolder) :*/ new Xhr(sessionHolder);
export const api: Api = new Api(xhr);
export const isMobile: boolean = mobile.isMobile();
export const messageBus = new Vue();
export const browserVersion: string = (function () {
  let ua = navigator.userAgent, tem,
      M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];

    return 'IE ' + (tem[1] || '');
  }
  if (M[1] === 'Chrome') {
    tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
    if (tem != undefined) { return tem.slice(1).join(' ').replace('OPR', 'Opera'); }
  }
  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
  if ((tem = ua.match(/version\/(\d+)/i)) != undefined) { M.splice(1, 1, tem[1]); }

  return M.join(' ');
})() + (isMobile ? ' mobile' : '');
export const isFirefox = browserVersion.indexOf('Firefox') >= 0;
export const WEBRTC_STUNT_URL = isFirefox ? 'stun:23.21.150.121' : 'stun:stun.l.google.com:19302';
export const isChrome = browserVersion.indexOf('Chrome') >= 0;
export const storage: IStorage = window.openDatabase ? new DatabaseWrapper('v124x') : new LocalStorage();
store.setStorage(storage); // TODO mvoe to main
export const globalLogger: Logger = loggerFactory.getLoggerColor('global', '#007a70');
const WS_URL = WS_API_URL.replace('{}', window.location.host);
export const ws: WsHandler = new WsHandler(WS_URL, sessionHolder, store);
export const notifier: NotifierHandler = new NotifierHandler(api, browserVersion, isChrome, isMobile, ws, store);
export const channelsHandler: ChannelsHandler = new ChannelsHandler(store, api, ws, notifier, messageBus);
export const webrtcApi: WebRtcApi = new WebRtcApi(ws, store, notifier);

window.onerror = function (msg, url, linenumber, column, errorObj) {
  const message = `Error occurred in ${url}:${linenumber}\n${msg}`;
  if ((!store.userSettings || store.userSettings.sendLogs) && api) {
    api.sendLogs(`${url}:${linenumber}:${column || '?'}\n${msg}\n\nOBJ:  ${errorObj || '?'}`, browserVersion, GIT_HASH);
  }
  store.growlError(message);

  return false;
};
