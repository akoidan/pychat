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
import type WsHandler from "@/ts/message_handlers/WsHandler";
import type Api from "@/ts/message_handlers/Api";
import type {Logger} from "lines-logger";
import type {DefaultStore} from "@/ts/classes/DefaultStore";
import type {
  GoogleCaptcha,
  PlatformUtil,
} from "@/ts/types/model";
import type WsMessageHandler from "@/ts/message_handlers/WsMessageHandler";
import type {
  IStorage,
  JsAudioAnalyzer,
} from "@/ts/types/types";
import type WebRtcApi from "@/ts/webrtc/WebRtcApi";
import type Subscription from "@/ts/classes/Subscription";
import type {Router} from "vue-router";
import type {MessageSenderProxy} from "@/ts/message_handlers/MessageSenderProxy";
import type {RoomHandler} from "@/ts/message_handlers/RomHandler";
import type {App as VueApp} from "@vue/runtime-core";
import type {SmileysApi} from "@/ts/utils/smileys";
import type Fetch from "@/ts/classes/Fetch";

declare global {
  interface Window {
    GIT_VERSION: string | undefined;
    vue: VueApp;
    onloadrecaptcha(): any;
    router: Router;
    api: Api;
    deferredPrompt: BeforeInstallPromptEvent;
    wsMessageHandler: WsMessageHandler;
    roomHandler: RoomHandler;
    xhr: Fetch;
    ws: WsHandler;
    storage: IStorage;
    store: DefaultStore;
    webrtcApi: WebRtcApi;
    grecaptcha: GoogleCaptcha;
    audioProcesssors: JsAudioAnalyzer[];
    savedFiles: Record<string, Blob>;
    sub: Subscription;
    consts: {};
    runtimeConsts: {};
  }
}

declare module "@vue/runtime-core" {
  export interface ComponentCustomProperties {
    $ws: WsHandler;
    $api: Api;
    $store: DefaultStore;
    $logger: Logger;
    $smileyApi: SmileysApi;
    $platformUtil: PlatformUtil;
    $messageSenderProxy: MessageSenderProxy;
    $messageBus: Subscription;
    $webrtcApi: WebRtcApi;
  }
}
