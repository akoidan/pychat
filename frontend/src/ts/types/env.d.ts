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
import type Http from "@/ts/classes/Http";
import type {Router} from "vue-router";
import type {MessageSenderProxy} from "@/ts/message_handlers/MessageSenderProxy";
import type {RoomHandler} from "@/ts/message_handlers/RomHandler";
import type {App as VueApp} from "@vue/runtime-core";
import type {SmileysApi} from "@/ts/utils/smileys";

declare global {
  interface Window {
    GIT_VERSION: string | undefined;
    vue: VueApp;
    router: Router;
    api: Api;
    deferredPrompt: BeforeInstallPromptEvent;
    wsMessageHandler: WsMessageHandler;
    roomHandler: RoomHandler;
    xhr: Http;
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
    $noVerbose?: true;
    $smileyApi: SmileysApi;
    $platformUtil: PlatformUtil;
    $messageSenderProxy: MessageSenderProxy;
    $messageBus: Subscription;
    $webrtcApi: WebRtcApi;
  }
}
