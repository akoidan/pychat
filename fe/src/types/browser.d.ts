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

declare interface HTMLAudioElement {
  setSinkId(v: string): void;
}
