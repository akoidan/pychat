declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}

declare module '*.json' {
  const value: any;
  export default value;
}


declare interface Document {
  cancelFullScreen(): void;
  msCancelFullScreen(): void;
  mozCancelFullScreen(): void;
  mozFullscreenElement: any;
  msFullscreenElement: any;
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
