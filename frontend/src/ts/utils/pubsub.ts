import {
  DefaultWsInMessage,
  HandlerName
} from "@common/ws/common";

//
// export type PureModel<T> = {
//   [P in keyof Omit<T, "isNewRecord" | "version"> as T[P] extends Date | number[] | boolean | number | string | undefined ? P : never]: T[P]
// };
//
// export type PickByType<T, Value> = {
//   [P in keyof T as T[P] extends Value | undefined ? P : never]: T[P]
// };
//
// <TCT extends (TCT[TPN] extends TPT[TPN] ? unknown : never), TPN extends (keyof TCT & keyof TPT)>



export function Subscribe<K extends DefaultWsInMessage<A, H, D>, A extends string = string, H extends HandlerName = HandlerName, D extends any = any>() {
  return (target: any, memberName: K['action'], propertyDescriptor: PropertyDescriptor) => {
    if (!target.__handlers) {
      target.__handlers = {}
    }
    target.__handlers[memberName] = memberName;
  };
}
