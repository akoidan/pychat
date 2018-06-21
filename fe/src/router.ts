import Vue from 'vue';
import VueRouter from 'vue-router';
import sessionHolder from './utils/sessionHolder';
import store from './store';
import MainPage from './components/MainPage.vue';
import ChannelsPage from './components/chat/MainPage.vue';
import SignupPage from './components/singup/MainPage.vue';
import ResetPassword from './components/singup/ResetPassword.vue';
import Login from './components/singup/Login.vue';
import SignUp from './components/singup/SignUp.vue';
import ProfilePage from './components/pages/ProfilePage.vue';
import CreatePrivateRoom from './components/pages/CreatePrivateRoom.vue';
import RoomSettings from './components/pages/RoomSettings.vue';
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
          meta: {
            beforeEnter: (to, from, next) => {
              globalLogger.log('setActiveRoomId {}', to.params.id)();
              store.commit('setActiveRoomId', parseInt(to.params.id));
              next();
            },
          },
          path: '/chat/:id'
        },
        {
          component: ProfilePage,
          path: '/profile'
        },
        {
          component: RoomSettings,
          path: '/room-settings/:id'
        },
        {
          component: CreatePrivateRoom,
          path: '/create-private-room',
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
    }, {
      path: '*',
      beforeEnter: (to, from, next) => next('/chat/1')
    }
    ]
});
router.beforeEach((to, from, next) => {
  if (to.matched[0] && to.matched[0].meta && to.matched[0].meta.loginRequired && !sessionHolder.session) {
    next('/auth/login');
  } else {
    if (to.meta && to.meta.beforeEnter) {
      to.meta.beforeEnter(to, from, next);
    }
    next();
  }
});
export default router;