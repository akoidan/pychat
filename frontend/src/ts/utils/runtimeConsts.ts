import {DefaultInnerSystemMessage} from "@/ts/types/messages/helper";
import {ChangeP2pRoomInfoMessage} from "@/ts/types/messages/inner/change.p2p.room.info";
import {ChangeStreamMessage} from "@/ts/types/messages/inner/change.stream";
import {ChangeUserOnlineInfoMessage} from "@/ts/types/messages/inner/change.user.online.info";
import {CheckTransferDestroyMessage} from "@/ts/types/messages/inner/check.transfer.destroy";
import {ConnectToRemoteMessage} from "@/ts/types/messages/inner/connect.to.remote";
import {DestroyPeerConnectionMessage} from "@/ts/types/messages/inner/destroy.peer.connection";
import {InternetAppearMessage} from "@/ts/types/messages/inner/internet.appear";
import {LoginMessage} from "@/ts/types/messages/inner/login";
import {LogoutMessage} from "@/ts/types/messages/inner/logout";
import {PubSetRoomsMessage} from "@/ts/types/messages/inner/pub.set.rooms";
import {RouterNavigateMessage} from "@/ts/types/messages/inner/router.navigate";
import {SendSetMessagesStatusMessage} from "@/ts/types/messages/inner/send.set.messages.status";
import {SyncP2PMessage} from "@/ts/types/messages/inner/sync.p2p";
import mobile from "is-mobile";
import {
  BACKEND_ADDRESS,
  IS_SSL,
  PUBLIC_PATH,
  WEBRTC_CONFIG,
} from "@/ts/utils/consts";

export const isMobile: boolean = mobile.isMobile();

export const browserVersion: string = (function() {
  const ua = navigator.userAgent;
  let tem;
  let M: any = (/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i).exec(ua) || [];
  if ((/trident/i).test(M[1])) {
    tem = (/\brv[ :]+(\d+)/g).exec(ua) || [];

    return `IE ${tem[1] || ""}`;
  }
  if (M[1] === "Chrome") {
    tem = (/\b(OPR|Edge)\/(\d+)/).exec(ua);
    if (tem != undefined) {
      return tem.slice(1).join(" ").
        replace("OPR", "Opera");
    }
  }
  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, "-?"];
  if ((tem = (/version\/(\d+)/i).exec(ua)) != undefined) {
    M.splice(1, 1, tem[1]);
  }

  return M.join(" ");
}()) + (isMobile ? " mobile" : "");

export const webpSupported = (function() {
  const elem = document.createElement("canvas");
  if (elem.getContext && elem.getContext("2d")) {
    // Was able or not to get WebP representation
    return elem.toDataURL("image/webp").startsWith("data:image/webp");
  }
  // Very old browser like IE 8, canvas not supported
  return false;
}());

export const isFirefox = browserVersion.includes("Firefox");
export const isChrome = browserVersion.includes("Chrome");
const BACKEND_CURRENT_ADDRESS = BACKEND_ADDRESS.replace("{}", window.location.hostname);
export const WEBRTC_RUNTIME_CONFIG = (function() {
  // Replaces {} in the realm for hostname
  const result = JSON.parse(JSON.stringify(WEBRTC_CONFIG));
  if (result.iceServers) {
    result.iceServers.forEach((ic: {urls: string[]}) => {
      if (ic.urls) {
        ic.urls = ic.urls.map((i: string) => i.replace("{}", window.location.hostname));
      }
    });
  }
  return result;
}());
export const WS_API_URL = `ws${IS_SSL ? "s" : ""}://${BACKEND_CURRENT_ADDRESS}/ws`;
export const XHR_API_URL = `http${IS_SSL ? "s" : ""}://${BACKEND_CURRENT_ADDRESS}/api`;
export const MEDIA_API_URL = PUBLIC_PATH ? PUBLIC_PATH : `http${IS_SSL ? "s" : ""}://${BACKEND_CURRENT_ADDRESS}`;
