import Vue from 'vue';
import VueRouter from 'vue-router';
import signup from './components/singup/router';
import main from './components/chat/router';
import App from './components/App.vue';
import sessionHolder from './utils/sessionHolder';
import loggerFactory from './utils/loggerFactory';
import store from './store';

Vue.use(VueRouter);
const logger = loggerFactory.getLogger('ROUTE', 'color: black;');
const router = new VueRouter({
  routes: [main, signup, {
    path: '*',
    beforeEnter: (to, from, next) => {
      let session = sessionHolder.session;
      logger.log('Entered invalid page, proceeding session {}', session)();
      if (session) {
        next('/chat/1');
      } else {
        next('/auth/login');
      }
    }
  }]
});
router.beforeEach((to, from, next) => {
  if (to.name === 'chat') { // https://github.com/vuejs/vue-router/issues/1012
    store.commit('setActiveRoomId', parseInt(to.params.id));
  }
  next();
});
export default router;