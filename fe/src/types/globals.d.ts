import WsHandler from '@/utils/WsHandler';
import Api from '@/utils/api';
import {Logger} from 'lines-logger';
import VueRouter, {Route} from 'vue-router';
import {DefaultStore} from '@/utils/store';
import {GoogleCaptcha} from '@/types/model';
import ChannelsHandler from '@/utils/ChannelsHandler';
import {IStorage, JsAudioAnalyzer} from '@/types/types';
import WebRtcApi from '@/webrtc/WebRtcApi';
import Subscription from '@/utils/Subscription';
import Http from '@/utils/Http';

import Vue, { Component } from 'vue';
import { ExtendedVue } from 'vue/types/vue';

declare global {
  interface Window {
    GIT_VERSION: string|undefined;
    vue: Vue;
    router: VueRouter;
    api: Api;
    channelsHandler: ChannelsHandler;
    xhr: Http;
    ws: WsHandler;
    storage: IStorage;
    webrtcApi: WebRtcApi;
    grecaptcha: GoogleCaptcha;
    audioProcesssors: JsAudioAnalyzer[];
    sub: Subscription;
    consts: {};
  }
}

declare module 'vue/types/options' {

  interface ComponentOptions<V extends Vue,
      Data = DefaultData<V>,
      Methods = DefaultMethods<V>,
      Computed = DefaultComputed,
      PropsDef = PropsDefinition<DefaultProps>,
      Props = DefaultProps> {
    _componentTag?: string;
  }

}

declare module 'vue/types/vue' {

  interface VueConstructor<V extends Vue = Vue> {
    component<Data, Methods, Computed, Props>(
        id: string,
        definition: Component<Data, Methods, Computed, Props>,
    ): ExtendedVue<V, Data, Methods, Computed, Props>;
  }

  interface Vue {
    $ws: WsHandler;
    $api: Api;
    store: DefaultStore;
    logger: Logger;
    $router: VueRouter;
    $route: Route;
  }
}


declare interface Document {
  cancelFullScreen(): void;
  msCancelFullScreen(): void;
  mozCancelFullScreen(): void;
  mozFullscreenElement: any;
  msFullscreenElement: any;
  webkitFullscreenElement: any;
  webkitCancelFullScreen: any;
}

declare interface RTCPeerConnection {
  // obsolete (deprecated) TODO
  addStream(a: MediaStream): void;
  removeStream(a: MediaStream): void;
  onaddstream: (event: MediaStreamEvent) => void;
}
declare interface Notification {
  replaced: number;
}
declare interface NotificationOptions {
  replaced: number;
}
type Writeable<T> = { -readonly [P in keyof T]: T[P] };

declare interface RTCDataChannelInit {
  reliable?: boolean;
}

declare interface MediaDevices {
  getDisplayMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;
  getUserMedia(constraints: MediaStreamConstraints, successCallback: NavigatorUserMediaSuccessCallback, errorCallback: NavigatorUserMediaErrorCallback): void;
}

declare class MediaRecorder {
  constructor(stream: MediaStream, options: {});
  static isTypeSupported(t: string): boolean;
  onstop: Function;
  stop(): void;
  ondataavailable: Function;
  start(time?: number): void;
}

declare interface MediaStreamTrack {
  isShare: boolean;
}

declare class MediaRecorderDataAvailableEvent {
  data: { size: number };
}

declare  interface Blob {
  name?: string;
}

declare interface LocalFileSystem {

  mozRequestFileSystem(type: number, size: number, successCallback: FileSystemCallback, errorCallback?: ErrorCallback): void;
}


declare interface FormData {
  entries?(): Iterator<[unknown| Blob]>;
}

declare interface HTMLElement {
  msRequestFullscreen(): void;
  mozRequestFullScreen(): void;
  webkitRequestFullscreen(): void;
}

declare interface HTMLVideoElement {
  setSinkId(v: string): void;
}
