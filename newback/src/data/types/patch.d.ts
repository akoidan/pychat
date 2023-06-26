import type {
  DefaultWsInMessage,
  HandlerName,
} from "@common/ws/common";
import type {BaseWsInstance} from "@nestjs/websockets/adapters/ws-adapter";


export interface WebSocketContextData {
  userId: number;
  id: string;

  sendToClient<H extends HandlerName>(data: DefaultWsInMessage<any, H, any>);
}

// https://github.com/websockets/ws/issues/1517
declare module "ws" {
  class _WS extends WebSocket { }
  export interface WebSocket extends _WS, BaseWsInstance {
    context: WebSocketContextData;
  }
}
