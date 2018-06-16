import Vue from 'vue';
import VueRouter from 'vue-router';
import signup from './components/singup/router';
import main from './components/chat/router';
import App from './components/App.vue';
import sessionHolder from './utils/sessionHolder';
import loggerFactory from './utils/loggerFactory';

Vue.use(VueRouter);
const logger = loggerFactory.getLogger('ROUTE', 'color: black;');
const router = new VueRouter({
  routes: [main, signup]
});
router.beforeEach((to, from, next) => {
  if (to.fullPath === '/' ) {
    let session = sessionHolder.session;
    logger.log('Entered / page, proceeding session {}', session)();
    if (session) {
      next('/chat');
    } else {
      next('/auth/login');
    }
  } else {
    next();
  }
});

export default router;