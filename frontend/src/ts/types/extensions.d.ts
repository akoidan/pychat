declare module "*.json" {
  const value: any;
  export default value;
}

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

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module "*.vue.ts" {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
