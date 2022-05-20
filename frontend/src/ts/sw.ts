
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


import type {Logger} from "@/ts/utils/removeme";
import {LoggerFactory} from "@/ts/utils/removeme";

const {
  IS_DEBUG,
  BACKEND_ADDRESS,
  PUBLIC_PATH,
  GIT_HASH,
} = PYCHAT_CONSTS;
declare let clients: any;
declare let serviceWorkerOption: {assets: string[]};


const loggerFactory = new LoggerFactory(IS_DEBUG ? "trace" : "info");
const logger: Logger = loggerFactory.getLogger(`SW_${GIT_HASH}`);

let subScr: string | null = null;

/*
 * Exclude audio from being cached, since
 * 1: 206 partial response is uncacheable
 * audio request generate header range, which creates option request, which fails
 * https://stackoverflow.com/a/37614302/3872976
 */
serviceWorkerOption.assets = serviceWorkerOption.assets.filter((url) => !url.includes("/sounds/"));

const allAssetsSet: Record<string, boolean> = {};
const allAssets = serviceWorkerOption.assets.map((url) => {
  let value;
  // https://pychat.org/ + /asdf/ = invalid url, so use new URL
  if (PUBLIC_PATH) {
    value = new URL(url, PUBLIC_PATH).href; // https://pychat.org/ + /asdf/ = invalid url, so use new URL
  } else {
    value = new URL(url, (self as any).registration.scope).href;
  }
  allAssetsSet[value] = true;
  return value;
});

allAssets.push((self as any).registration.scope);
allAssetsSet[(self as any).registration.scope] = true;
// This event fires when service worker registers the first time
self.addEventListener("install", (event: any) => {
  logger.debug(" Delaying install event to put static resources")();
  event.waitUntil((async() => {

    /*
     * Assets cache filter only works for build into js files and then serve, rather than on vite-dev-server
     * since vite-dev-server uses ecma script modules
     */
    const staticCache = await caches.open("static");
    const assets = allAssets.filter((url) => url.includes("/smileys/") ||
      url.includes("/flags/") ||
      url.includes("/js/") ||
      url.includes("/css/") ||
      url.includes("/img/") ||
      (/\/font\/fontello.*\.woff2/).test(url) ||
      (/\/manifest.*\.json/).test(url) ||
      url === (self as any).registration.scope);
    logger.log("Putting to static cache {}", assets)();
    await staticCache.addAll(assets);
    const allFiles = await staticCache.keys();
    const oldFiles = allFiles.filter((r) => !allAssetsSet[r.url]);
    logger.debug("Putting to static cache finished, removing old files {}", oldFiles)();
    await Promise.all(oldFiles.map(async(oldFile) => staticCache.delete(oldFile)));
    logger.debug("Removed old files finished. Can proceed to activate now..")();
  })());
});

// Cache and return requests
self.addEventListener("fetch", async(event: any) => {
  // Cache only files, do not cache XHR API, so exist on POST immediately
  if (event.request.method !== "GET") {
    return;
  }

  // Do not cache sounds as they preload with 206
  const isSound = event.request.url.indexOf("/sounds/") >= 0;

  // Cache user mini avatars
  const belongsToThumbnailCache = event.request.url.indexOf("/photo/thumbnail/") >= 0;

  // Cache photos in Chat, like images with messages
  const belongsToPhotoCache = event.request.url.indexOf("/photo/") >= 0;

  /*
   * Cache .js files, .css files and etc if they didn't hit install event
   * if index.html request.url will be with `#`, but allAssetsSet doesn't contain a `#`
   */
  const belongsToStaticCache = allAssetsSet[event.request.url] || event.request.mode === "navigate";

  // If this request is not in cache mod, exit
  if (!belongsToThumbnailCache && !belongsToPhotoCache && !belongsToStaticCache || isSound) {
    return;
  }
  event.respondWith((async() => {
    const {request} = event;
    const cachedResponse: any = await caches.match(request);

    if (cachedResponse && request.mode !== "navigate") {
      logger.log(`Returning ${request.url} from cache`)();
      return cachedResponse;
    }

    let fetchedResponse: Response | null = null;
    let error = null;
    try {
      fetchedResponse = await fetch(request);
    } catch (e) {
      error = e;
    }

    if (fetchedResponse?.status === 206) {
      return fetchedResponse;
    }
    if (fetchedResponse?.ok) {
      /*
       * Assets cache filter only works for build into js files and then serve, rather than on vite-dev-server
       * Since vite-dev-server uses ecma script modules
       * Do not put partial response. E.g. preload audio
       */
      if (belongsToThumbnailCache) {
        logger.debug(`Adding ${request.url} to thumbnail cache`)();
        const cache = await caches.open("thumbnails"); // Users icon
        await cache.put(request, fetchedResponse.clone());
      } else if (belongsToPhotoCache) {
        const cache = await caches.open("photos"); // User sends image with a message
        logger.debug(`Adding ${request.url} to photos cache`)();
        await cache.put(request, fetchedResponse.clone());
      } else if (belongsToStaticCache) {
        logger.debug(`Putting ${request.url} to static cache`)();
        const cache = await caches.open("static"); // All static assets
        await cache.put(request, fetchedResponse.clone());
      }
      return fetchedResponse;
    }
    if (cachedResponse) {
      logger.warn(`Server returned {} for ${request.url}. Returning data from cache`, fetchedResponse || error)();
      return cachedResponse;
    }

    if (error) {
      throw error;
    }
    return fetchedResponse;
  })());
});


function getSubscriptionId(pushSubscription: any) {
  let mergedEndpoint = pushSubscription.endpoint;
  if (pushSubscription.endpoint.indexOf("https://fcm.googleapis.com/fcm/send") === 0 &&
    pushSubscription.subscriptionId &&
    pushSubscription.endpoint.indexOf(pushSubscription.subscriptionId) === -1) {
    mergedEndpoint = `${pushSubscription.endpoint}/${
      pushSubscription.subscriptionId}`;
  }

  const GCM_ENDPOINT = "https://fcm.googleapis.com/fcm/send";
  if (mergedEndpoint.indexOf(GCM_ENDPOINT) !== 0) {
    return null;
  }
  return mergedEndpoint.split("/").pop();
}

async function getPlayBack(event: unknown) {
  logger.debug("Received a push message {}", event)();
  if (!subScr) {
    const r = await (<any>self).registration.pushManager.getSubscription();
    subScr = getSubscriptionId(r);
  }
  if (!subScr) {
    throw Error("Unable to get subscription");
  }
  let address;
  // It's always https, since SW doesn't work in http.
  if (BACKEND_ADDRESS.includes("{}")) {
    // Self.registration returns "https://pychat.org/"
    address = `https://${BACKEND_ADDRESS.replace("{}", new URL((self as any).registration.scope).hostname)}`;
  } else {
    address = `https://${BACKEND_ADDRESS}`;
  }
  const response = await fetch(`${address}/api/get_firebase_playback?registration_id=${subScr}`, {
    credentials: "omit",
  });
  logger.debug("Fetching finished {}", response)();
  const t = await response.text();
  logger.debug("response is {}", t)();
  const m = JSON.parse(t);
  logger.debug("Parsed response {}", m)();
  const notifications = await (<any>self).registration.getNotifications();
  let count = 1;
  if (m.options && m.options.data) {
    if (m.options.icon) {
      if (m.options.icon.startsWith("/photo")) {
        const url = PUBLIC_PATH ? PUBLIC_PATH : address;
        m.options.icon = `${url}${m.options.icon}`;
      }
    }
    const {room} = m.options.data;
    const {sender} = m.options.data;
    for (let i = 0; i < notifications.length; i++) {
      if (room && notifications[i].data.room === room ||
        sender && notifications[i].data.sender === sender) {
        notifications[i].close();
        count += notifications[i].data.replaced || 1;
      }
    }
    if (count > 1) {
      m.options.data.replaced = count;
      if (room) {
        m.title = `Room: ${room}(+${count})`;
        m.options.body = `${sender}:${m.options.body}`;
      } else if (sender) {
        m.title = `${sender}(+${count})`;
      }
    }
  }
  logger.debug("Spawned notification {}", m)();
  await (<any>self).registration.showNotification(m.title, m.options);
}

self.addEventListener("push", (e: any) => e.waitUntil(getPlayBack(e)));

self.addEventListener("notificationclick", (event: any) => {
  logger.debug("On notification click: {}", event.notification.tag)();

  /*
   * Android doesn’t close the notification when you click on it
   * See: http://crbug.com/463146
   */
  event.notification.close();

  /*
   * This looks to see if the current is already open and
   * focuses if it is
   */
  event.waitUntil(clients.matchAll({
    type: "window",
  }).then((clientList: readonly Response[]) => {
    const roomId = event.notification.data && event.notification.data.roomId;
    if (clientList && clientList[0] && roomId) {
      (<{navigate: Function}>(<unknown>clientList[0])).navigate(`/#/chat/${roomId}`); // TODO
    } else if (clientList && clientList[0]) {
      (<{focus: Function}>(<unknown>clientList[0])).focus(); // TODO
    } else if (roomId) {
      clients.openWindow(`/#/chat/${roomId}`);
    } else {
      clients.openWindow("/");
    }
  }));
});
