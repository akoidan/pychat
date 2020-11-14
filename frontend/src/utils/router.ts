import Vue from 'vue';
import VueRouter from 'vue-router';
import sessionHolder from '@/instances/sessionInstance';
import { store } from '@/instances/storeInstance';
import MainPage from '@/components/MainPage.vue';
import ChannelsPage from '@/components/chat/ChannelsPage.vue';
import AuthPage from '@/components/singup/AuthPage.vue';
import ResetPassword from '@/components/singup/ResetPassword.vue';
import Login from '@/components/singup/Login.vue';
import SignUp from '@/components/singup/SignUp.vue';
import UserProfile from '@/components/pages/UserProfile.vue';
import InviteUser from '@/components/pages/InviteUser.vue';
import ReportIssue from '@/components/pages/ReportIssue.vue';
import UserProfileChangePassword from '@/components/pages/UserProfileChangePassword.vue';
import UserProfileImage from '@/components/pages/UserProfileImage.vue';
import UserProfileInfo from '@/components/pages/UserProfileInfo.vue';
import UserProfileSettings from '@/components/pages/UserProfileSettings.vue';
import CreatePrivateRoom from '@/components/pages/CreatePrivateRoom.vue';
import CreatePublicRoom from '@/components/pages/CreatePublicRoom.vue';
import ViewProfilePage from '@/components/pages/ViewProfilePage.vue';
import RoomSettings from '@/components/pages/RoomSettings.vue';
import ApplyResetPassword from '@/components/singup/ApplyResetPassword.vue';
import {
  ALL_ROOM_ID,
  PAINTER,
  STATISTICS
} from '@/utils/consts';
import ConfirmMail from '@/components/email/ConfirmMail.vue';
import UserProfileChangeEmail from '@/components/pages/UserProfileChangeEmail.vue';
import { Route } from 'vue-router/types';
import CreateRoomChannel from '@/components/pages/CreateRoomChannel.vue';
import CreateChannel from '@/components/pages/CreateChannel.vue';
import ChannelSettings from '@/components/pages/ChannelSettings.vue';
import { sub } from '@/instances/subInstance';
import MessageHandler from "@/utils/MesageHandler";
import {
  HandlerType,
  HandlerTypes
} from "@/types/types";
import { Logger } from "lines-logger";
import {
  LoginMessage,
  LogoutMessage,
  RouterNavigateMessage
} from "@/types/messages";
import loggerFactory from "@/instances/loggerFactory";

Vue.use(VueRouter);

const logger: Logger = loggerFactory.getLoggerColor('router', '#057f59');

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
          component: () => import(/* webpackChunkName: "spainter" */'@/components/pages/PainterPage.vue'),
          path: '/painter'
        }]: [],
        ...STATISTICS ? [{
          component: () => import(/* webpackChunkName: "amchart" */ '@/components/pages/AmChart.vue'),
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


sub.subscribe('router', new class extends MessageHandler {

  protected readonly logger: Logger = logger;

  protected readonly handlers: HandlerTypes = {
    login: <HandlerType>this.login,
    logout: <HandlerType>this.logout,
    navigate: <HandlerType>this.navigate
  }

  logout(a: LogoutMessage) {
    router.replace('/auth/login');
  }

  navigate(a: RouterNavigateMessage) {
    router.replace(a.to);
  }

  login(a: LoginMessage) {
    if (!/\w{32}/.exec(a.session)) {
      throw a.session;
    }
    sessionHolder.session = a.session;
    router.replace(`/chat/${ALL_ROOM_ID}`);
  }

}());

export default router;
