import VueRouter, {Route, RawLocation, NavigationGuard} from 'vue-router';

declare module 'vue/types/vue' {
  interface Vue {
    $router: VueRouter;
    $route: Route;
  }
}