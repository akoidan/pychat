declare module "*.json" {
  const value: any;
  export default value;
}

declare module "*.ico";
declare module "*.wav";
declare module "*.mp3";
declare module "*.gif";
declare module "*.svg";
declare module "*.png";

declare module "*.vue" {
  import type {DefineComponent, DefineComponent} from "vue";

  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "*.vue.ts" {
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
