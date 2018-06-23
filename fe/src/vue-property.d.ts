import {WsHandler} from './utils/WsHandler';
import {Logger} from './types';
import Api from './utils/api';

declare module 'vue/types/vue' {

  interface Vue {
    ws: WsHandler;
    api: Api;
    logger: Logger;
  }
}