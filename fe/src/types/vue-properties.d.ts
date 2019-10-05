import WsHandler from '@/utils/WsHandler';
import Api from '@/utils/api';
import {Logger} from 'lines-logger';
import Vue from 'vue';
import VueRouter, {Route} from 'vue-router';
import {DefaultStore} from '@/utils/store';
import {GoogleCaptcha} from '@/types/model';

declare global {
  interface Window {
    GIT_VERSION: string|undefined;
    vue: Vue;
    router: VueRouter;
    api: Api;
    grecaptcha: GoogleCaptcha;
  }
}

declare module 'vue/types/vue' {

  interface Vue {
    $ws: WsHandler;
    $api: Api;
    store: DefaultStore;
    logger: Logger;
    $router: VueRouter;
    $route: Route;
  }
}
