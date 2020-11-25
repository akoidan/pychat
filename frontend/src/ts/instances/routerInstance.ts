import Vue from 'vue';
import VueRouter from 'vue-router';
import sessionHolder from '@/ts/instances/sessionInstance';
import { store } from '@/ts/instances/storeInstance';
import MainPage from '@/vue/MainPage.vue';
import ChannelsPage from '@/vue/chat/ChannelsPage.vue';
import AuthPage from '@/vue/singup/AuthPage.vue';
import ResetPassword from '@/vue/singup/ResetPassword.vue';
import Login from '@/vue/singup/Login.vue';
import SignUp from '@/vue/singup/SignUp.vue';
import UserProfile from '@/vue/pages/UserProfile.vue';
import InviteUser from '@/vue/pages/InviteUser.vue';
import ReportIssue from '@/vue/pages/ReportIssue.vue';
import UserProfileChangePassword from '@/vue/pages/UserProfileChangePassword.vue';
import UserProfileImage from '@/vue/pages/UserProfileImage.vue';
import UserProfileInfo from '@/vue/pages/UserProfileInfo.vue';
import UserProfileSettings from '@/vue/pages/UserProfileSettings.vue';
import CreatePrivateRoom from '@/vue/pages/CreatePrivateRoom.vue';
import CreatePublicRoom from '@/vue/pages/CreatePublicRoom.vue';
import ViewProfilePage from '@/vue/pages/ViewProfilePage.vue';
import RoomSettings from '@/vue/pages/RoomSettings.vue';
import ApplyResetPassword from '@/vue/singup/ApplyResetPassword.vue';
import {
  ALL_ROOM_ID,
  PAINTER,
  STATISTICS
} from '@/ts/utils/consts';
import ConfirmMail from '@/vue/email/ConfirmMail.vue';
import UserProfileChangeEmail from '@/vue/pages/UserProfileChangeEmail.vue';
import { Route } from 'vue-router/types';
import CreateRoomChannel from '@/vue/pages/CreateRoomChannel.vue';
import CreateChannel from '@/vue/pages/CreateChannel.vue';
import ChannelSettings from '@/vue/pages/ChannelSettings.vue';
import { sub } from '@/ts/instances/subInstance';
import MessageHandler from '@/ts/message_handlers/MesageHandler';
import { Logger } from 'lines-logger';
import loggerFactory from '@/ts/instances/loggerFactory';
import {
  HandlerType,
  HandlerTypes
} from '@/ts/types/messages/baseMessagesInterfaces';
import {
  LoginMessage,
  LogoutMessage,
  RouterNavigateMessage
} from '@/ts/types/messages/innerMessages';
import UserProfileOauthSettings from '@/vue/pages/UserProfileOauthSettings.vue';

Vue.use(VueRouter);

const logger: Logger = loggerFactory.getLogger('router');

export const router = new VueRouter({
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
          redirect: `/chat/${ALL_ROOM_ID}`
        },
        {
          component: ChannelsPage,
          meta: {
            beforeEnter: (to: Route, from: Route, next: Function) => {
              logger.debug('setActiveRoomId {}', to.params.id)();
              store.setActiveRoomId(parseInt(to.params.id));
              next();
            }
          },
          name: 'chat',
          path: '/chat/:id'
        },
        ...PAINTER ? [{
          component: () => import(/* webpackChunkName: 'spainter' */'@/vue/pages/PainterPage.vue'),
          path: '/painter'
        }]: [],
        ...STATISTICS ? [{
          component: () => import(/* webpackChunkName: 'amchart' */ '@/vue/pages/AmChart.vue'),
          path: '/statistics'
        }]: [],
        {
          component: ViewProfilePage,
          path: '/user/:id'
        },
        {
          component: CreateRoomChannel,
          path: '/create-room',
          children: [
            {
              path: '',
              redirect: '/create-room/public'
            },
            {
              component: CreatePublicRoom,
              path: 'public'
            },
            {
              path: 'channel',
              component: CreateChannel
            }
          ]
        },
        {
          component: UserProfile,
          path: '/profile',
          children: [
            {
              path: '',
              redirect: '/profile/settings'
            },
            {
              path: 'user-info',
              component: UserProfileInfo
            },
            {
              path: 'change-password',
              component: UserProfileChangePassword
            },
            {
              path: 'change-email',
              component: UserProfileChangeEmail
            },
            {
              path: 'oauth-settings',
              component: UserProfileOauthSettings
            },
            {
              path: 'image',
              component: UserProfileImage
            },
            {
              path: 'settings',
              component: UserProfileSettings
            }
          ]
        },
        {
          component: RoomSettings,
          path: '/room-settings/:id'
        },
        {
          component: ChannelSettings,
          path: '/channel-settings/:id'
        },
        {
          component: CreatePrivateRoom,
          path: '/create-private-room'
        },
        {
          component: InviteUser,
          path: '/invite-user/:id'
        },
        {
          component: ReportIssue,
          path: '/report-issue'
        }
      ]
    }, {
      path: '/auth',
      component: AuthPage,
      meta: {
        loginRequired: false
      },
      children: [
        {
          path: '',
          redirect: '/auth/login'
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
          component: SignUp
        },
        {
          path: 'proceed-reset-password',
          component: ApplyResetPassword
        }
      ]
    }, {
      path: '/confirm_email',
      component: ConfirmMail
    }, {
      path: '*',
      redirect: `/chat/${ALL_ROOM_ID}`
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


sub.subscribe('router', new class RouterProcesssor extends MessageHandler {

  protected readonly logger: Logger = logger;

  protected readonly handlers: HandlerTypes<keyof RouterProcesssor, 'router'> = {
    login: <HandlerType<'login', 'router'>>this.login,
    logout: <HandlerType<'logout', 'router'>>this.logout,
    navigate:<HandlerType<'navigate', 'router'>>this.navigate
  }

  logout(a: LogoutMessage) {
    router.replace('/auth/login');
  }

  navigate(a: RouterNavigateMessage) {
    if (router.currentRoute.path !== a.to) {
      router.replace(a.to);
    }
  }

  login(a: LoginMessage) {
    if (!/\w{32}/.exec(a.session)) {
      throw a.session;
    }
    sessionHolder.session = a.session;
    router.replace(`/chat/${ALL_ROOM_ID}`);
  }

}());
