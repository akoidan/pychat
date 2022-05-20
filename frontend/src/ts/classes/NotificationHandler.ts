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
import type {InternetAppearMessage} from "@/ts/types/messages/inner/internet.appear";
import loggerFactory from "@/ts/instances/loggerFactory";
import type {Logger} from "lines-logger";
import {extractError} from "@/ts/utils/pureFunctions";
import type Api from "@/ts/message_handlers/Api";
import type WsHandler from "@/ts/message_handlers/WsHandler";
import type {DefaultStore} from "@/ts/classes/DefaultStore";
import {
  CONNECTION_ERROR,
  GIT_HASH,
  IS_DEBUG,
  SERVICE_WORKER_URL,
  SERVICE_WORKER_VERSION_LS_NAME,
} from "@/ts/utils/consts";

import MessageHandler from "@/ts/message_handlers/MesageHandler";
import type {MainWindow} from "@/ts/classes/MainWindow";
import type Subscription from "@/ts/classes/Subscription";


export default class NotifierHandler extends MessageHandler {
  protected readonly logger: Logger;

  protected readonly handlers: HandlerTypes<keyof NotifierHandler> = {
    internetAppear: <HandlerType<"internetAppear", InternetAppearMessage>> this.internetAppear,
  };

  private readonly mainWindow: MainWindow;

  private readonly popedNotifQueue: Notification[] = [];

  private retryFcm: Function | null = null;

  /* This is required to know if this tab is the only one and don't spam with same notification for each tab*/
  private serviceWorkedTried = false;

  private serviceWorkerRegistration: any = null;

  private subscriptionId: string | null = null;

  private newMessagesCount: number = 0;

  private readonly store: DefaultStore;

  private readonly api: Api;

  private readonly browserVersion: string;

  private readonly isChrome: boolean;

  private readonly isMobile: boolean;

  private readonly ws: WsHandler;

  private readonly documentTitle: string;

  private readonly sub: Subscription;

  public constructor(api: Api, browserVersion: string, isChrome: boolean, isMobile: boolean, ws: WsHandler, store: DefaultStore, mainWindow: MainWindow, sub: Subscription) {
    super();
    this.api = api;
    this.browserVersion = browserVersion;
    this.isChrome = isChrome;
    this.isMobile = isMobile;
    this.ws = ws;
    this.mainWindow = mainWindow;
    this.documentTitle = document.title;
    this.store = store;
    this.sub = sub;
    this.logger = loggerFactory.getLogger("notify");
    window.addEventListener("focus", this.onFocus.bind(this));
    this.sub.subscribe("notifier", this);
    this.onFocus(null);
  }

  public async internetAppear() {
    if (!this.serviceWorkedTried) {
      await this.tryAgainRegisterServiceWorker();
    }
    if (this.retryFcm) {
      this.retryFcm();
    }
  }

  public replaceIfMultiple(data: {title: string; options: NotificationOptions}) {
    let count = 1;
    const newMessData = data.options.data;
    if (newMessData && newMessData.replaced) {
      this.popedNotifQueue.forEach((e: Notification) => {
        if (e.data && e.data.title === newMessData.title || e.title === newMessData.title) {
          count += e.replaced || e.data.replaced;
          e.close();
        }
      });
      if (count > 1) {
        newMessData.replaced = count;
        data.title = `${newMessData.title}(+${count})`;
      }
    }
  }

  /**
   * @return true if Permissions were asked and user granted them
   *
   */
  public async checkPermissions() {
    if ((<any>Notification).permission !== "granted") { // TODO
      const result = await Notification.requestPermission();
      if (result !== "granted") {
        throw Error("User blocked notification permission. Notifications won't be available");
      }

      return true;
    }

    return false;
  }

  public async tryAgainRegisterServiceWorker() {
    try {
      if (!(<any>window).Notification) {
        throw Error("Notifications are not supported");
      }
      const granted = await this.checkPermissions();
      if (granted) {
        await this.showNot("Pychat notifications are enabled", {
          body: "You can disable them in room's settings",
          replaced: 1,
        });
      }
      if (!this.serviceWorkedTried) {
        await this.registerWorker();
      }
    } catch (e) {
      this.logger.error("Error registering service worker {}", extractError(e))();
    } finally {
      this.serviceWorkedTried = true;
    }
  }

  public async showNotification(title: string, options: NotificationOptions) {
    if (this.store.isCurrentWindowActive) {
      return;
    }
    this.newMessagesCount++;
    document.title = `${this.newMessagesCount} new messages`;
    try {
      navigator.vibrate(200);
    } catch (e) {
      this.logger.debug("Vibration skipped, because ", e);
    }
    // Last opened tab not this one, leave the oppotunity to show notification from last tab
    if (!(<any>window).Notification ||
      !this.mainWindow.isTabMain()) {
      return;
    }
    await this.checkPermissions();
    await this.showNot(title, options);
  }

  public onFocus(e: Event | null) {
    if (e) {
      this.logger.debug("Marking current tab as active, pinging server")();
      if (this.store.userInfo && this.ws.isWsOpen() && !IS_DEBUG) {
        this.ws.pingServer(); // If no event = call from init();
      }
    } else {
      this.logger.debug("Marking current tab as active")();
    }
    this.newMessagesCount = 0;
    document.title = this.documentTitle;
    this.popedNotifQueue.forEach((n) => {
      n.close();
    });
  }


  // Permissions are granted here!
  private async showNot(title: string, options: NotificationOptions) {
    this.logger.debug("Showing notification {} {}", title, options);
    if (this.serviceWorkerRegistration && this.isMobile && this.isChrome) {

      /*
       * TODO  options should contain page id here but it's not
       * so we open unfefined url
       */
      const r = await this.serviceWorkerRegistration.showNotification(title, options);
      this.logger.debug("res {}", r)(); // TODO https://stackoverflow.com/questions/39717947/service-worker-notification-promise-broken#comment83407282_39717947
    } else {
      const data = {
        title,
        options,
      };
      this.replaceIfMultiple(data);
      const not = new Notification(data.title, data.options);
      if (data.options.replaced) {
        not.replaced = data.options.replaced;
      }
      this.popedNotifQueue.push(not);
      not.onclick = () => {
        window.focus();
        if (not.data && not.data.roomId) {
          this.store.setActiveRoomId(parseInt(not.data.roomId));
        }
        not.close();
      };
      not.onclose = () => {
        this.popedNotifQueue.splice(this.popedNotifQueue.indexOf(not), 1);
      };
      this.logger.debug("Notification {} {} has been spawned, current queue {}", title, options, this.popedNotifQueue)();
    }
  }

  private async registerWorker() {
    if (!navigator.serviceWorker) {
      throw Error("Service worker is not supported");
    } else if (!SERVICE_WORKER_URL) {
      throw Error("FIREBASE_API_KEY is missing in settings.py or file manifest.json is missing");
    }

    let r: ServiceWorkerRegistration = (await navigator.serviceWorker.getRegistration())!;
    const version = localStorage.getItem(SERVICE_WORKER_VERSION_LS_NAME) || "";
    if (version !== GIT_HASH || !r) {
      this.logger.log(`Updating sw {} version ${version} to ${GIT_HASH}`, r)();
      r = await navigator.serviceWorker.register(SERVICE_WORKER_URL, {scope: "/"});
      if (r) {
        this.logger.debug("Registered service worker {}", r)();
        this.logger.log(`Registered SW ${GIT_HASH} {}`, r)();
        localStorage.setItem(SERVICE_WORKER_VERSION_LS_NAME, `${GIT_HASH}`);
      } else {
        this.logger.error("Registered failed somehow", r)();
        throw Error("Sw registration failed");
      }
    } else {
      this.logger.log(`SW is up to date, v=${version} {}, skipping the update`, r)();
    }

    this.serviceWorkerRegistration = await navigator.serviceWorker.ready;
    this.logger.debug("Service worker is ready {}", this.serviceWorkerRegistration)();

    const subscription = await this.serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true});
    if (!subscription) {
      throw Error("Check permissions");
    }
    this.logger.log("Got subscription {}", subscription)();

    this.subscriptionId = subscription.toJSON() as string;
    if (!this.subscriptionId) {
      throw Error("Current browser doesnt support offline notifications");
    }

    if (subscription.endpoint && subscription.endpoint.startsWith("https://fcm.googleapis.com/fcm/send")) {
      const registrationId = subscription.endpoint.split("/").pop();
      this.retryFcm = async() => {
        try {
          await this.api.restApi.registerFCM(registrationId, this.browserVersion, this.isMobile);
          this.retryFcm = null;
        } catch (e) {
          if (e !== CONNECTION_ERROR) {
            this.retryFcm = null;
          }
          throw e;
        }
      };
      this.retryFcm();
      this.logger.log("Saved subscription to server")();
    } else {
      this.logger.warn("Unsupported subscription type {}", subscription.endpoint)();
    }
  }
}
