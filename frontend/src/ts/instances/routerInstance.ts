import type {LoginMessage, LoginMessageBody} from "@/ts/types/messages/inner/login";
import type {LogoutMessage} from "@/ts/types/messages/inner/logout";
import type {RouterNavigateMessage, RouterNavigateMessageBody} from "@/ts/types/messages/inner/router.navigate";
import {createRouter, createWebHashHistory} from "vue-router";
import {store} from "@/ts/instances/storeInstance";
import MainPage from "@/vue/pages/MainPage.vue";
import ChannelsPage from "@/vue/pages/ChannelsPage.vue";
import AuthPage from "@/vue/auth/AuthPage.vue";
import ResetPassword from "@/vue/auth/ResetPassword.vue";
import SignIn from "@/vue/auth/SignIn.vue";
import SignUp from "@/vue/auth/SignUp.vue";
import UserProfile from "@/vue/pages/UserProfile.vue";
import UserProfileChangePassword from "@/vue/pages/UserProfileChangePassword.vue";
import UserProfileImage from "@/vue/pages/UserProfileImage.vue";
import UserProfileInfo from "@/vue/pages/UserProfileInfo.vue";
import UserProfileSettings from "@/vue/pages/UserProfileSettings.vue";
import CreatePrivateRoom from "@/vue/pages/CreatePrivateRoom.vue";
import ViewProfilePage from "@/vue/pages/ViewProfilePage.vue";
import RoomSettings from "@/vue/pages/RoomSettings.vue";
import ApplyResetPassword from "@/vue/auth/ApplyResetPassword.vue";
import {ACTIVE_ROOM_ID_LS_NAME, ALL_ROOM_ID} from "@/ts/utils/consts";
import ConfirmMail from "@/vue/pages/ConfirmMail.vue";
import UserProfileChangeEmail from "@/vue/pages/UserProfileChangeEmail.vue";
import CreateChannel from "@/vue/pages/CreateChannel.vue";
import ChannelSettings from "@/vue/pages/ChannelSettings.vue";
import MessageHandler from "@/ts/message_handlers/MesageHandler";
import type {Logger} from "lines-logger";
import loggerFactory from "@/ts/instances/loggerFactory";

import UserProfileOauthSettings from "@/vue/pages/UserProfileOauthSettings.vue";
import PainterPage from "@/vue/pages/PainterPage.vue";
import RoomUsersListPage from "@/vue/pages/RoomUsersListPage.vue";
import ChannelAddRoom from "@/vue/pages/ChannelAddRoom.vue";
import type Subscription from "@/ts/classes/Subscription";
import type {SessionHolder} from "@/ts/types/types";
import {Subscribe} from "@/ts/utils/pubsub";


export function routerFactory(sub: Subscription, sessionHolder: SessionHolder) {
  const logger: Logger = loggerFactory.getLogger("router");
  const router = createRouter({
    history: createWebHashHistory(), // Seems like createWebHistory is really hard for sw to detect what to cache, so use this one
    routes: [
      {
        path: "",
        component: MainPage,
        beforeEnter: (to, from) => {
          if (!sessionHolder.session) {
            return "/auth/sign-in";
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
        ],
      }, {
        path: "/auth",
        component: AuthPage,
        children: [
          {
            path: "",
            redirect: "/auth/sign-in",
          },
          {
            path: "sign-in",
            component: SignIn,
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
        path: "/confirm-email",
        component: ConfirmMail,
      }, {
        path: "/:catchAll(.*)",
        redirect: `/chat/${ALL_ROOM_ID}`,
      },
    ],
  });

  router.beforeEach((to, from, next) => {
    if (to.matched[0]?.meta?.loginRequired && !sessionHolder.session) {
      next("/auth/sign-in");
    } else {
      if (to?.meta?.beforeEnter) {
        (to.meta.beforeEnter as any)(to, from, next);
      }
      next();
    }
  });

   class RouterProcessor {
    protected readonly logger: Logger = logger;

    @Subscribe<LogoutMessage>()
    public logout() {
      router.replace("/auth/sign-in");
    }

    @Subscribe<RouterNavigateMessage>()
    public navigate(a: RouterNavigateMessageBody) {
      if (router.currentRoute.value.path !== a.to) {
        router.replace(a.to);
      }
    }

    @Subscribe<LoginMessage>()
    public login(a: LoginMessageBody) {
      if (!a.session) {
        throw Error(`Invalid session ${a.session}`);
      }
      sessionHolder.session = a.session;
      router.replace(`/chat/${ALL_ROOM_ID}`);
    }
  }

  sub.subscribe("router", new RouterProcessor());
  return router;
}
