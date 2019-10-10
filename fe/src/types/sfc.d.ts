declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}

declare module '*.json' {
  const value: any;
  export default value;
}

interface SingleParamCB<T> {
  (t: T): void;
}


declare interface Document {
  cancelFullScreen(): void;
  msCancelFullScreen(): void;
  mozCancelFullScreen(): void;
  mozFullscreenElement: any;
  msFullscreenElement: any;
}

declare interface RTCPeerConnection {
  // obsolete (deprecated) TODO
  addStream(a: MediaStream): void;
  removeStream(a: MediaStream): void;
  onaddstream: (event: MediaStreamEvent) => void;
}


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
}

declare module '*.ico' {

}

declare module '*.wav' {

}

declare module '*.mp3' {

}

declare module '*.gif' {

}

declare module '*.svg' {

}
declare module '*.png' {

}
