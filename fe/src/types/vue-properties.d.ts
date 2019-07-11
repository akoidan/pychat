import WsHandler from '../utils/WsHandler';
import Api from '../utils/api';
import {Logger} from 'lines-logger';
import Vue from 'vue';
import {Store} from 'vuex';
import VueRouter, {Route} from 'vue-router';
import {GoogleCaptcha, RootState} from '../types/model';

declare global {
  interface Window {
    GIT_VERSION: string|undefined;
    vue: Vue;
    store: Store<RootState>;
    router: VueRouter;
    api: Api;
    grecaptcha: GoogleCaptcha;
  }
}

declare module 'vue/types/vue' {

  interface Vue {
    $ws: WsHandler;
    $api: Api;
    logger: Logger;
    $router: VueRouter;
    $route: Route;
  }
}
