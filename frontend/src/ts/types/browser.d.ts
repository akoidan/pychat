declare interface Document {
  mozFullscreenElement: any;
  msFullscreenElement: any;
  webkitFullscreenElement: any;
  webkitCancelFullScreen: any;

  cancelFullScreen(): void;

  msCancelFullScreen(): void;

  mozCancelFullScreen(): void;
}

declare interface RTCPeerConnection {
  onaddstream(event: any): void;

  // Obsolete (deprecated) TODO
  addStream(a: MediaStream): void;

  removeStream(a: MediaStream): void;
}

declare interface Notification {
  replaced: number;
}

declare interface NotificationOptions {
  replaced: number;
}

type Writeable<T> = {-readonly [P in keyof T]: T[P]};

declare interface RTCDataChannelInit {
  reliable?: boolean;
}

/**
 * The BeforeInstallPromptEvent is fired at the Window.onbeforeinstallprompt handler
 * before a user is prompted to "install" a web site to a home screen on mobile.
 *
 * @deprecated Only supported on Chrome and Android Webview.
 */
declare interface BeforeInstallPromptEvent extends Event {

  /**
   * Returns an array of DOMString items containing the platforms on which the event was dispatched.
   * This is provided for user agents that want to present a choice of versions to the user such as,
   * for example, "web" or "play" which would allow the user to chose between a web version or
   * an Android version.
   */
  readonly platforms: string[];

  /**
   * Returns a Promise that resolves to a DOMString containing either "accepted" or "dismissed".
   */
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;

  /**
   * Allows a developer to show the install prompt at a time of their own choosing.
   * This method returns a Promise.
   */
  prompt(): Promise<void>;

}

declare interface MediaDevices {
  getDisplayMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;

  getUserMedia(constraints: MediaStreamConstraints, successCallback: any, errorCallback: any): void;
}

/*
 * Declare class MediaRecorder {
 *   public onstop: Function;
 *   public ondataavailable: Function;
 *   public constructor(stream: MediaStream, options: {});
 *   public static isTypeSupported(t: string): boolean;
 *   public stop(): void;
 *   public start(time?: number): void;
 * }
 */

declare interface MediaStreamTrack {
  isShare: boolean;
  isCanvas: boolean;
}

declare class MediaRecorderDataAvailableEvent {
  public data: {size: number};
}

declare interface Blob {
  name?: string;
}

declare interface LocalFileSystem {

  mozRequestFileSystem(type: number, size: number, successCallback: FileSystemCallback, errorCallback?: ErrorCallback): void;
}

declare interface FormData {
  entries?(): Iterator<[Blob | unknown]>;
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
