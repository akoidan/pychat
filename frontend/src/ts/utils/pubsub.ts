import {
  DefaultWsInMessage,
  HandlerName
} from "@common/ws/common";


export function Subscribe<K extends DefaultWsInMessage<A, H, D>, A extends string = string, H extends HandlerName = HandlerName, D extends any = any>() {
  return (target: any, memberName: K['action'], propertyDescriptor: TypedPropertyDescriptor<((firstParameter: K["data"]) => void)> | TypedPropertyDescriptor<(() => void)>) => {
    if (!target.__handlers) {
      target.__handlers = {}
    }
    target.__handlers[memberName] = memberName;
  };
}
