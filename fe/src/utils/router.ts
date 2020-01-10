import Vue from "vue";
import VueRouter from "vue-router";
import sessionHolder from "@/utils/sessionHolder";
import {store} from "@/utils/storeHolder";
import MainPage from "@/components/MainPage.vue";
import ChannelsPage from "@/components/chat/MainPage.vue";
import SignupPage from "@/components/singup/MainPage.vue";
import ResetPassword from "@/components/singup/ResetPassword.vue";
import Login from "@/components/singup/Login.vue";
import SignUp from "@/components/singup/SignUp.vue";
import UserProfile from "@/components/pages/UserProfile.vue";
import InviteUser from "@/components/pages/InviteUser.vue";
import ReportIssue from "@/components/pages/ReportIssue.vue";
import UserProfileChangePassword from "@/components/pages/UserProfileChangePassword.vue";
import UserProfileImage from "@/components/pages/UserProfileImage.vue";
import UserProfileInfo from "@/components/pages/UserProfileInfo.vue";
import UserProfileSettings from "@/components/pages/UserProfileSettings.vue";
import CreatePrivateRoom from "@/components/pages/CreatePrivateRoom.vue";
import PainterPage from "@/components/pages/PainterPage.vue";
import CreatePublicRoom from "@/components/pages/CreatePublicRoom.vue";
import ViewProfilePage from "@/components/pages/ViewProfilePage.vue";
import RoomSettings from "@/components/pages/RoomSettings.vue";
import ApplyResetPassword from "@/components/singup/ApplyResetPassword.vue";
import {globalLogger} from "@/utils/singletons";
import {ALL_ROOM_ID} from "@/utils/consts";
import ConfirmMail from "@/components/email/ConfirmMail.vue";
import UserProfileChangeEmail
  from "@/components/pages/UserProfileChangeEmail.vue";
import {Route} from "vue-router/types";

Vue.use(VueRouter);

const router = new VueRouter({
  routes: [
    {
      path: "",
      component: MainPage,
      meta: {
        loginRequired: true,
      },
      children: [
        {
          path: "",
          redirect: `/chat/${ALL_ROOM_ID}`,
        },
        {
          component: ChannelsPage,
          meta: {
            beforeEnter: (to: Route, from: Route, next: Function) => {
              globalLogger.debug("setActiveRoomId {}", to.params.id)();
              store.setActiveRoomId(parseInt(to.params.id));
              next();
            },
          },
          name: "chat",
          path: "/chat/:id",
        },
        {
          component: PainterPage,
          path: "/painter",
        },
        {
          component: () => import(/* WebpackChunkName: "amchart" */ "@/components/pages/AmChart.vue"),
          path: "/statistics",
        },
        {
          component: ViewProfilePage,
          path: "/user/:id",
        },
        {
          component: UserProfile,
          path: "/profile",
          children: [
            {
              path: "",
              redirect: "/profile/settings",
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
              path: "image",
              component: UserProfileImage,
            },
            {
              path: "settings",
              component: UserProfileSettings,
            },
          ],
        },
        {
          component: RoomSettings,
          path: "/room-settings/:id",
        },
        {
          component: CreatePrivateRoom,
          path: "/create-private-room",
        },
        {
          component: CreatePublicRoom,
          path: "/create-public-room",
        },
        {
          component: InviteUser,
          path: "/invite-user/:id",
        },
        {
          component: ReportIssue,
          path: "/report-issue",
        },
      ],
    }, {
      path: "/auth",
      component: SignupPage,
      meta: {
        loginRequired: false,
      },
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
      path: "*",
      redirect: `/chat/${ALL_ROOM_ID}`,
    },
  ],
});
router.beforeEach((to, from, next) => {
  if (to.matched[0] && to.matched[0].meta && to.matched[0].meta.loginRequired && !sessionHolder.session) {
    next("/auth/login");
  } else {
    if (to.meta && to.meta.beforeEnter) {
      to.meta.beforeEnter(to, from, next);
    }
    next();
  }
});
export default router;
