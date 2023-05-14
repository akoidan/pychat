import {
  DefaultWsInMessage,
  HandlerName
} from "@common/ws/common";
import {DefaultP2pMessage} from "@/ts/types/messages/p2p";


export function Subscribe<K extends DefaultWsInMessage<A, H, D>, A extends string = string, H extends HandlerName = HandlerName, D extends any = any>() {
  return (target: any, memberName: K['action'], propertyDescriptor:
      TypedPropertyDescriptor<((firstParameter: K["data"]) => void)>
      | TypedPropertyDescriptor<(() => void)>
      | TypedPropertyDescriptor<(() => Promise<void>)>
      | TypedPropertyDescriptor<((firstParameter: K["data"]) => Promise<void>)>
  ) => {
    if (!target.__handlers) {
      target.__handlers = {}
    }
    target.__handlers[memberName] = memberName;
  };
}

export function P2PSubscribe<K extends DefaultP2pMessage<A, D>, A extends string = string, D extends any = any>() {
  return (target: any, memberName: K['action'], propertyDescriptor:
      TypedPropertyDescriptor<((firstParameter: K["data"]) => void)>
      | TypedPropertyDescriptor<(() => void)>
      | TypedPropertyDescriptor<(() => Promise<void>)>
      | TypedPropertyDescriptor<((firstParameter: K) => Promise<void>)>
  ) => {
    if (!target.__p2p_handlers) {
      target.__p2p_handlers = {}
    }
    target.__p2p_handlers[memberName] = memberName;
  };
}
