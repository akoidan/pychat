import type WsApi from "@/ts/message_handlers/WsApi";
import type HttpApi from "@/ts/message_handlers/HttpApi";
import type {Logger} from "lines-logger";
import type {DefaultStore} from "@/ts/classes/DefaultStore";
import type {GoogleCaptcha, PlatformUtil} from "@/ts/types/model";
import type WsMessageHandler from "@/ts/message_handlers/WsMessageHandler";
import type {IStorage, JsAudioAnalyzer} from "@/ts/types/types";
import type WebRtcApi from "@/ts/webrtc/WebRtcApi";
import type Subscription from "@/ts/classes/Subscription";
import type {Router} from "vue-router";
import type {MessageSenderProxy} from "@/ts/message_handlers/MessageSenderProxy";
import type {RoomHandler} from "@/ts/message_handlers/RomHandler";
import type {App as VueApp} from "@vue/runtime-core";
import type {SmileysApi} from "@/ts/utils/smileys";

declare global {
  interface Window {
    GIT_VERSION: string | undefined;
    vue: VueApp;
    onloadrecaptcha(): any;
    router: Router;
    api: HttpApi;
    deferredPrompt: BeforeInstallPromptEvent;
    wsMessageHandler: WsMessageHandler;
    roomHandler: RoomHandler;
    ws: WsApi;
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
    $ws: WsApi;
    $api: HttpApi;
    $store: DefaultStore;
    $logger: Logger;
    $smileyApi: SmileysApi;
    $platformUtil: PlatformUtil;
    $messageSenderProxy: MessageSenderProxy;
    $messageBus: Subscription;
    $webrtcApi: WebRtcApi;
  }
}
