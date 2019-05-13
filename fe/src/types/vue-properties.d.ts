import WsHandler from '../utils/WsHandler';
import Api from '../utils/api';
import {Logger} from 'lines-logger';
import VueRouter, {Route} from 'vue-router';


declare module 'vue/types/vue' {

  interface Vue {
    $ws: WsHandler;
    $api: Api;
    logger: Logger;
    $router: VueRouter;
    $route: Route;
  }
}