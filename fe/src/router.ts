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
import SignUp from './components/singup/SignUp.vue';
import ApplyResetPassword from './components/singup/ApplyResetPassword.vue';
import {globalLogger} from './utils/singletons';

Vue.use(VueRouter);
const router = new VueRouter({
  routes: [
    {
      path: '',
      component: MainPage,
      meta: {
        loginRequired: true
      },
      children: [
        {
          path: '',
          beforeEnter: (to, from, next) => next('/chat/1')
        },
        {
          component: ChannelsPage,
          beforeEnter: (to, from, next) => {
            store.commit('setActiveRoomId', parseInt(to.params.id));
            next();
          },
          path: '/chat/:id'
        }
      ]
    }, {
      path: '/auth',
      component: SignupPage,
      meta: {
        loginRequired: false
      },
      children: [
        {
          path: '',
          beforeEnter: (to, from, next) => next('/auth/login')
        },
        {
          path: 'login',
          component: Login
        },
        {
          path: 'reset-password',
          component: ResetPassword
        },
        {
          path: 'sign-up',
          component: SignUp,
        },
        {
          path: 'proceed-reset-password',
          component: ApplyResetPassword
        }
      ]
    }]
});
router.beforeEach((to, from, next) => {
  if (to.matched[0] && to.matched[0].meta && to.matched[0].meta.loginRequired && !sessionHolder.session) {
    next('/auth/login');
  } else {
    next();
  }
});
export default router;