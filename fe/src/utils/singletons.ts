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
import {IStorage} from '../types';
import loggerFactory from './loggerFactory';


export const channelsHandler = new ChannelsHandler();
export const storage: IStorage = window.openDatabase ? new DatabaseWrapper( 'userName') : new LocalStorage();
export  const globalLogger: Logger = loggerFactory.getLogger('GLOBAL', 'color: #687000; font-weight: bold');
export const xhr: Xhr = new Xhr(API_URL_DEFAULT);
export const ws = new WsHandler(channelsHandler, null, storage, store, router);

export const api: Api = new Api(xhr, store);