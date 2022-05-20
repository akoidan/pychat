import {FaceBookSignInRequest, FacebookSignInResponse} from "@common/http/auth/facebook.sign.in";
import {GoogleSignInRequest, GoogleSignInResponse} from "@common/http/auth/google.sign.in";
import {SignInRequest, SignInResponse} from "@common/http/auth/sign.in";
import {SignUpRequest, SignUpResponse} from "@common/http/auth/sign.up";
import {ValidateUserRequest, ValidateUserResponse} from "@common/http/auth/validate.user";
import {ValidateEmailResponse, ValidateUserEmailRequest} from "@common/http/auth/validte.email";
import {SaveFileRequest, SaveFileResponse} from "@common/http/file/save.file";
import {AcceptTokenRequest, AcceptTokenResponse} from "@common/http/verify/accept.token";
import {ConfirmEmailRequest, ConfirmEmailResponse} from "@common/http/verify/confirm.email";
import {SendRestorePasswordRequest, SendRestorePasswordResponse} from "@common/http/verify/send.restore.password";
import {VerifyTokenRequest, VerifyTokenResponse} from "@common/http/verify/verify.token";
import {ChannelDto} from "@common/model/dto/channel.dto";
import {FileModelDto} from "@common/model/dto/file.model.dto";
import {GiphyDto} from "@common/model/dto/giphy.dto";
import {LocationDto} from "@common/model/dto/location.dto";
import {MessageModelDto} from "@common/model/dto/message.model.dto";
import {RoomDto, RoomNoUsersDto} from "@common/model/dto/room.dto";
import {UserDto} from "@common/model/dto/user.dto";
import {UserProfileDto, UserProfileDtoWoImage} from "@common/model/dto/user.profile.dto";
import {UserSettingsDto} from "@common/model/dto/user.settings.dto";
import {Gender} from "@common/model/enum/gender";
import {ImageType} from "@common/model/enum/image.type";
import {MessageStatus} from "@common/model/enum/message.status";
import {Theme} from "@common/model/enum/theme";
import {VerificationType} from "@common/model/enum/verification.type";
import {CaptchaRequest, OauthSessionResponse, OkResponse, SessionResponse} from "@common/model/http.base";
import {BrowserBase, CallStatus, OpponentWsId, ReplyWebRtc, WebRtcDefaultMessage} from "@common/model/webrtc.base";
import {
  AddRoomBase, ChangeDeviceType, ChangeOnlineType,
  ChangeUserOnlineBase,
  MessagesResponseMessage,
  NewRoom,
  RoomExistedBefore
} from "@common/model/ws.base";
import {
  DestroyCallConnectionBody,
  DestroyCallConnectionMessage
} from "@common/ws/message/peer-connection/destroy.call.connection";
import {
  DestroyFileConnectionBody,
  DestroyFileConnectionMessage
} from "@common/ws/message/peer-connection/destroy.file.connection";
import {RetryFileMessage} from "@common/ws/message/peer-connection/retry.file";
import {SendRtcDataBody, SendRtcDataMessage} from "@common/ws/message/peer-connection/send.rtc.data";
import {AddChannelBody, AddChannelMessage} from "@common/ws/message/room/add.channel";
import {AddInviteBody, AddInviteMessage} from "@common/ws/message/room/add.invite";
import {AddOnlineUserBodyMessage, AddOnlineUserMessage} from "@common/ws/message/room/add.online.user";
import {AddRoomBody, AddRoomMessage} from "@common/ws/message/room/add.room";
import {CreateNewUsedMessage, CreateNewUserBody} from "@common/ws/message/room/create.new.user";
import {DeleteChannelBody, DeleteChannelMessage} from "@common/ws/message/room/delete.channel";
import {DeleteRoomBody, DeleteRoomMessage} from "@common/ws/message/room/delete.room";
import {InviteUserBody, InviteUserMessage} from "@common/ws/message/room/invite.user";
import {LeaveUserBody, LeaveUserMessage} from "@common/ws/message/room/leave.user";
import {RemoveOnlineUserBody, RemoveOnlineUserMessage} from "@common/ws/message/room/remove.online.user";
import {SaveChannelSettingsBody, SaveChannelSettingsMessage} from "@common/ws/message/room/save.channel.settings";
import {SaveRoomSettingsBody, SaveRoomSettingsMessage} from "@common/ws/message/room/save.room.settings";
import {
  ShowITypeWsInBody,
  ShowITypeWsInMessage,
  ShowITypeWsOutBody,
  ShowITypeWsOutMessage
} from "@common/ws/message/room/show.i.type";
import {WebRtcSetConnectionIdBody, WebRtcSetConnectionIdMessage} from "@common/ws/message/sync/set.connection.id";
import {NotifyCallActiveBody, NotifyCallActiveMessage} from "@common/ws/message/webrtc/notify.call.active";
import {OfferCallBody, OfferCallMessage} from "@common/ws/message/webrtc/offer.call";
import {OfferFileBody, OfferFileContent, OfferFileMessage} from "@common/ws/message/webrtc/offer.file";
import {OfferBody, OfferMessage} from "@common/ws/message/webrtc/offer.message";
import {AcceptCallBody, AcceptCallMessage} from "@common/ws/message/webrtc-transfer/accept.call";
import {AcceptFileBody, AcceptFileMessage} from "@common/ws/message/webrtc-transfer/accept.file";
import {ReplyCallBody, ReplyCallMessage} from "@common/ws/message/webrtc-transfer/reply.call";
import {ReplyFileBody, ReplyFileMessage} from "@common/ws/message/webrtc-transfer/reply.file";
import {PingBody, PingMessage} from "@common/ws/message/ws/ping";
import {PongBody, PongMessage} from "@common/ws/message/ws/pong";
import {SetProfileImageBody, SetProfileImageMessage} from "@common/ws/message/ws/set.profile.image";
import {SetSettingBody, SetSettingsMessage} from "@common/ws/message/ws/set.settings";
import {SetUserProfileBody, SetUserProfileMessage} from "@common/ws/message/ws/set.user.profile";
import {SetWsIdWsOutBody, SetWsIdWsOutMessage} from "@common/ws/message/ws/set.ws.id";
import {UserProfileChangedBody, UserProfileChangedMessage} from "@common/ws/message/ws/user.profile.changed";
import {DeleteMessage, DeleteMessageBody} from "@common/ws/message/ws-message/delete.message";
import {
  PrintMessageWsInMessage,
  PrintMessageWsOutBody,
  PrintMessageWsOutMessage
} from "@common/ws/message/ws-message/print.message";
import {
  GetCountryCodeWsInBody, GetCountryCodeWsInMessage,
  GetCountryCodeWsOutBody,
  GetCountryCodeWsOutMessage
} from "@common/ws/message/get.country.code";
import {GrowlWsInBody, GrowlWsInMessage} from "@common/ws/message/growl.message";
import {
  SetMessageStatusWsInBody, SetMessageStatusWsInMessage,
  SetMessageStatusWsOutBody,
  SetMessageStatusWsOutMessage
} from "@common/ws/message/set.message.status";
import {
  SyncHistoryWsInBody,
  SyncHistoryWsInMessage,
  SyncHistoryWsOutBody,
  SyncHistoryWsOutMessage
} from "@common/ws/message/sync.history";
import {
  DefaultWsInMessage,
  DefaultWsOutMessage,
  HandlerName,
  RequestWsOutMessage,
  ResponseWsInMessage
} from "@common/ws/common";
import {ALL_ROOM_ID, MAX_USERNAME_LENGTH, WS_SESSION_EXPIRED_CODE} from "@common/consts";
import type {LoginMessageBody, LoginMessage} from "@/ts/types/messages/inner/login";
import type {LogoutMessage} from "@/ts/types/messages/inner/logout";
import type {
  RouterNavigateMessage,
  RouterNavigateMessageBody,
} from "@/ts/types/messages/inner/router.navigate";
import {
  createRouter,
  createWebHashHistory,
} from "vue-router";
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

import UserProfileOauthSettings from "@/vue/pages/UserProfileOauthSettings.vue";
import PainterPage from "@/vue/pages/PainterPage.vue";
import RoomUsersListPage from "@/vue/pages/RoomUsersListPage.vue";
import ChannelAddRoom from "@/vue/pages/ChannelAddRoom.vue";
import type Subscription from "@/ts/classes/Subscription";
import type {SessionHolder} from "@/ts/types/types";


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

  sub.subscribe("router", new class RouterProcessor extends MessageHandler {
    protected readonly logger: Logger = logger;

    protected readonly handlers: HandlerTypes<keyof RouterProcessor> = {
      login: <HandlerType<"login", LoginMessage>> this.login,
      logout: <HandlerType<"logout", LogoutMessage>> this.logout,
      navigate: <HandlerType<"navigate", RouterNavigateMessage>> this.navigate,
    };

    logout() {
      router.replace("/auth/sign-in");
    }

    navigate(a: RouterNavigateMessageBody) {
      if (router.currentRoute.value.path !== a.to) {
        router.replace(a.to);
      }
    }

    login(a: LoginMessageBody) {
      if (!a.session) {
        throw Error(`Invalid session ${a.session}`);
      }
      sessionHolder.session = a.session;
      router.replace(`/chat/${ALL_ROOM_ID}`);
    }
  }());
  return router;
}
