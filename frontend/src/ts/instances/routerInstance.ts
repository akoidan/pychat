import {
  createRouter,
  createWebHashHistory,
} from "vue-router";
import sessionHolder from "@/ts/instances/sessionInstance";
import {store} from "@/ts/instances/storeInstance";
import MainPage from "@/vue/pages/MainPage.vue";
import ChannelsPage from "@/vue/pages/ChannelsPage.vue";
import AuthPage from "@/vue/singup/AuthPage.vue";
import ResetPassword from "@/vue/singup/ResetPassword.vue";
import Login from "@/vue/singup/Login.vue";
import SignUp from "@/vue/singup/SignUp.vue";
import UserProfile from "@/vue/pages/UserProfile.vue";
import ReportIssue from "@/vue/pages/ReportIssue.vue";
import UserProfileChangePassword from "@/vue/pages/UserProfileChangePassword.vue";
import UserProfileImage from "@/vue/pages/UserProfileImage.vue";
import UserProfileInfo from "@/vue/pages/UserProfileInfo.vue";
import UserProfileSettings from "@/vue/pages/UserProfileSettings.vue";
import CreatePrivateRoom from "@/vue/pages/CreatePrivateRoom.vue";
import ViewProfilePage from "@/vue/pages/ViewProfilePage.vue";
import RoomSettings from "@/vue/pages/RoomSettings.vue";
import ApplyResetPassword from "@/vue/singup/ApplyResetPassword.vue";
import {
  ACTIVE_ROOM_ID_LS_NAME,
  ALL_ROOM_ID,
} from "@/ts/utils/consts";
import ConfirmMail from "@/vue/pages/ConfirmMail.vue";
import UserProfileChangeEmail from "@/vue/pages/UserProfileChangeEmail.vue";
import CreateChannel from "@/vue/pages/CreateChannel.vue";
import ChannelSettings from "@/vue/pages/ChannelSettings.vue";
import MessageHandler from "@/ts/message_handlers/MesageHandler";
import type {Logger} from "lines-logger";
import loggerFactory from "@/ts/instances/loggerFactory";
import type {
  HandlerType,
  HandlerTypes,
} from "@/ts/types/messages/baseMessagesInterfaces";
import type {
  LoginMessage,
  LogoutMessage,
  RouterNavigateMessage,
} from "@/ts/types/messages/innerMessages";
import UserProfileOauthSettings from "@/vue/pages/UserProfileOauthSettings.vue";
import PainterPage from "@/vue/pages/PainterPage.vue";
import RoomUsersListPage from "@/vue/pages/RoomUsersListPage.vue";
import ChannelAddRoom from "@/vue/pages/ChannelAddRoom.vue";
import type Subscription from "@/ts/classes/Subscription";


export function routerFactory(sub: Subscription) {
  const logger: Logger = loggerFactory.getLogger("router");
  const router = createRouter({
    history: createWebHashHistory(), // Seems like createWebHistory is really hard for sw to detect what to cache, so use this one
    routes: [
      {
        path: "",
        component: MainPage,
        beforeEnter: (to, from) => {
          if (!sessionHolder.session) {
            return "/auth/login";
          }
        },
        children: [
          {
            path: "",
            redirect: (to) => {
              const prevActiveRoomId = localStorage.getItem(ACTIVE_ROOM_ID_LS_NAME);
              if (prevActiveRoomId) {
                return `/chat/${prevActiveRoomId}`;
              }
              return `/chat/${ALL_ROOM_ID}`;
            },
          },
          {
            component: ChannelsPage,
            meta: {
              // This should be in meta, if it's in the same lvl as component, it won't be executed when route.params.id change
              beforeEnter: (to: any, from: any) => {
                // This should be set before instance is creeated, otherwise activeRoomId could be null and lots of componentfail
                logger.debug("setActiveRoomId {}", to.params.id)();
                store.setActiveRoomId(parseInt(to.params.id as string));
              },
              hasOwnNavBar: true,
            },
            name: "chat",
            path: "/chat/:id",
          },
          {
            component: PainterPage,
            path: "/painter",
          },
          {
            component: ViewProfilePage,
            path: "/user/:id",
          },
          {
            component: CreateChannel,
            path: "/create-group",
          },
          {
            path: "settings",
            component: UserProfileSettings,
          },
          {
            component: UserProfile,
            path: "/profile",
            children: [
              {
                path: "",
                redirect: "/profile/user-info",
              },
              {
                path: "user-info",
                component: UserProfileInfo,
              },
              {
                path: "change-password",
                component: UserProfileChangePassword,
              },
              {
                path: "change-email",
                component: UserProfileChangeEmail,
              },
              {
                path: "oauth-settings",
                component: UserProfileOauthSettings,
              },
              {
                path: "image",
                component: UserProfileImage,
              },
            ],
          },
          {
            path: "/channel/:id/settings",
            component: ChannelSettings,
          },
          {
            path: "/channel/:id/room",
            component: ChannelAddRoom,
          },
          {
            component: RoomSettings,
            path: "/room-settings/:id",
          },
          {
            component: RoomUsersListPage,
            path: "/room-users/:id",
          },
          {
            component: CreatePrivateRoom,
            path: "/create-private-room",
          },
          {
            component: ReportIssue,
            path: "/report-issue",
          },
        ],
      }, {
        path: "/auth",
        component: AuthPage,
        children: [
          {
            path: "",
            redirect: "/auth/login",
          },
          {
            path: "login",
            component: Login,
          },
          {
            path: "reset-password",
            component: ResetPassword,
          },
          {
            path: "sign-up",
            component: SignUp,
          },
          {
            path: "proceed-reset-password",
            component: ApplyResetPassword,
          },
        ],
      }, {
        path: "/confirm_email",
        component: ConfirmMail,
      }, {
        path: "/:catchAll(.*)",
        redirect: `/chat/${ALL_ROOM_ID}`,
      },
    ],
  });

  router.beforeEach((to, from, next) => {
    if (to.matched[0]?.meta?.loginRequired && !sessionHolder.session) {
      next("/auth/login");
    } else {
      if (to?.meta?.beforeEnter) {
        (to.meta.beforeEnter as any)(to, from, next);
      }
      next();
    }
  });

  sub.subscribe("router", new class RouterProcessor extends MessageHandler {
    protected readonly logger: Logger = logger;

    protected readonly handlers: HandlerTypes<keyof RouterProcessor, "router"> = {
      login: <HandlerType<"login", "router">> this.login,
      logout: <HandlerType<"logout", "router">> this.logout,
      navigate: <HandlerType<"navigate", "router">> this.navigate,
    };

    logout(a: LogoutMessage) {
      router.replace("/auth/login");
    }

    navigate(a: RouterNavigateMessage) {
      if (router.currentRoute.value.path !== a.to) {
        router.replace(a.to);
      }
    }

    login(a: LoginMessage) {
      if (!a.session) {
        throw Error(`Invalid session ${a.session}`);
      }
      sessionHolder.session = a.session;
      router.replace(`/chat/${ALL_ROOM_ID}`);
    }
  }());
  return router;
}
