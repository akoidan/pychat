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


declare module '*.svg' {

}