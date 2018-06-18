import Vue from 'vue';
import VueRouter from 'vue-router';
import sessionHolder from './utils/sessionHolder';
import loggerFactory from './utils/loggerFactory';
import store from './store';
import MainPage from './components/MainPage.vue';
import ChannelsPage from './components/chat/MainPage.vue';
import SignupPage from './components/singup/MainPage.vue';
import ResetPassword from './components/singup/ResetPassword.vue';
import Login from './components/singup/Login.vue';
import Register from './components/singup/Register.vue';
import ApplyResetPassword from './components/singup/ApplyResetPassword.vue';

Vue.use(VueRouter);
const logger = loggerFactory.getLogger('ROUTE', 'color: black;');
const router = new VueRouter({
  routes: [
    {
      path: '',
      component: MainPage,
      children: [
        {
          path: '',
          beforeEnter: (to, from, next) => next('/chat/1')
        },
        {
          component: ChannelsPage,
          path: '/chat/:id',
          name: 'chat'
        }
      ]
    }, {
      path: '/auth',
      component: SignupPage,
      name: 'auth',
      children: [
        {
          path: '',
          beforeEnter: (to, from, next) => next('/auth/login')
        },
        {
          path: 'login',
          component: Login,
          name: 'login',
        },
        {
          path: 'reset-password',
          component: ResetPassword,
          name: 'reset-password',
        },
        {
          path: 'sign-up',
          component: Register,
          name: 'register',
        },
        {
          path: 'proceed-reset-password',
          component: ApplyResetPassword,
          name: 'proceed-reset',
        }
      ]
    }, {
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