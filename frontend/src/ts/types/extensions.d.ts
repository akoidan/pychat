/*
 eslint-disable @typescript-eslint/naming-convention,
 @typescript-eslint/ban-types,
 import/no-duplicates,
 @typescript-eslint/no-explicit-any,
 @typescript-eslint/no-duplicate-imports,
 import/unambiguous
 */
declare const PYCHAT_CONSTS: {
  IS_DEBUG: boolean;
  BACKEND_ADDRESS: string;
  GOOGLE_OAUTH_2_CLIENT_ID: string | false;
  FACEBOOK_APP_ID: string | false;
  PUBLIC_PATH: string | null;
  RECAPTCHA_PUBLIC_KEY: string | false;
  AUTO_REGISTRATION: boolean;
  ISSUES: boolean;
  GITHUB_LINK: string | false;
  FLAGS: boolean;
  GIT_HASH: string;
  IS_ANDROID: boolean;
  // TODO
  ELECTRON_MAIN_FILE: string;
  SERVICE_WORKER_URL: string | null;
  ELECTRON_IGNORE_SSL: boolean;
  // TODO
  CAPTCHA_IFRAME: string | false;
  WEBRTC_CONFIG: RTCConfiguration;
  GIPHY_API_KEY: string;
};


declare module "*.ico" {
  const result: string;
  export default result;
}

declare module "*.wav" {
  const result: string;
  export default result;
}
declare module "*.mp3" {
  const result: string;
  export default result;
}
declare module "*.gif" {
  const result: string;
  export default result;
}
declare module "*.svg" {
  const result: string;
  export default result;
}
declare module "*.png" {
  const result: string;
  export default result;
}
declare module "*.json" {
  const value: any;
  export default value;
}


declare module "*.vue" {
  import type {DefineComponent} from "vue";

  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "*.vue.ts" {
  import type {DefineComponent} from "vue";

  const component: DefineComponent<{}, {}, any>;
  export default component;
}
