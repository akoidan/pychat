import Xhr from './Xhr';
import {WsHandler} from './WsHandler';
import ChannelsHandler from './ChannelsHandler';
import DatabaseWrapper from './DatabaseWrapper';
import {API_URL_DEFAULT} from './consts';
import LocalStorage from './LocalStorage';
import store from '../store';
import router from '../router';
import Api from './api';
import {IStorage, Logger} from '../types/types';
import loggerFactory from './loggerFactory';
import sessionHolder from './sessionHolder';

export const xhr: Xhr = new Xhr(API_URL_DEFAULT, sessionHolder);
export const api: Api = new Api(xhr);
export const channelsHandler = new ChannelsHandler(store, api);
export const storage: IStorage = window.openDatabase ? new DatabaseWrapper( 'userName') : new LocalStorage();
export  const globalLogger: Logger = loggerFactory.getLoggerColor('global', '#000000');
export const ws = new WsHandler(sessionHolder, channelsHandler, null, storage, store, router);

