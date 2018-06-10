import {Logger, LoggerFactory} from './Logger';
import Xhr from './Xhr';
import {WsHandler} from './WsHandler';
import ChannelsHandler from './ChannelsHandler';
import DatabaseWrapper from './DatabaseWrapper';
import {API_URL_DEFAULT} from './consts';
import LocalStorage from './LocalStorage';
import store from '../store';
import router from '../router';
import Api from './api';
const loggerFactory = new LoggerFactory(true);

let storageLogger = loggerFactory.getLogger('DB', 'color: blue; font-weight: bold');
export const storage: IStorage = window.openDatabase ? new DatabaseWrapper(storageLogger, 'userName') : new LocalStorage(storageLogger);
export  const globalLogger: Logger = loggerFactory.getLogger('GLOBAL', 'color: #687000; font-weight: bold');
export const xhr: Xhr = new Xhr(loggerFactory.getLogger('HTTP', 'color: green; font-weight: bold'), API_URL_DEFAULT);
export const ws = new WsHandler(loggerFactory.getLogger('WS', 'color: green;'), null, null, storage, store, router);
export const channelsHandler = new ChannelsHandler(loggerFactory.getLogger('CHAT', 'color: #FF0F00; font-weight: bold'));
export const api: Api = new Api(xhr, store);