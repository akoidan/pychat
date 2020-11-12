import Xhr from '@/utils/Xhr';
import WsHandler from '@/utils/WsHandler';
import ChannelsHandler from '@/utils/ChannelsHandler';
import DatabaseWrapper from '@/utils/DatabaseWrapper';
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
import {PlatformUtil} from '@/types/model';
import {IS_ANDROID} from '@/utils/consts'
import {AndroidPlatformUtil, NullPlatformUtil} from '@/utils/nativeUtils';
import {browserVersion, isMobile, isChrome} from '@/utils/runtimeConsts';


export const xhr: Http = /* window.fetch ? new Fetch(XHR_API_URL, sessionHolder) :*/ new Xhr(sessionHolder);
export const api: Api = new Api(xhr);
export const messageBus = new Vue();
// @ts-ignore: next-line
export const storage: IStorage = window.openDatabase ? new DatabaseWrapper('v132') : new LocalStorage();
store.setStorage(storage); // TODO mvoe to main
export const globalLogger: Logger = loggerFactory.getLoggerColor('global', '#007a70');
const WS_URL = WS_API_URL.replace('{}', window.location.host);
export const ws: WsHandler = new WsHandler(WS_URL, sessionHolder, store);
export const notifier: NotifierHandler = new NotifierHandler(api, browserVersion, isChrome, isMobile, ws, store);
export const channelsHandler: ChannelsHandler = new ChannelsHandler(store, api, ws, notifier, messageBus);
export const webrtcApi: WebRtcApi = new WebRtcApi(ws, store, notifier);
export const platformUtil: PlatformUtil = IS_ANDROID ? new AndroidPlatformUtil(): new NullPlatformUtil();
