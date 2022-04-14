import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {WebSocket} from "ws";
import {WebSocketContextData} from '@/data/types/internal';


export const WebsocketContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    let handler =  ctx.getArgs().find(a => a instanceof WebSocket)
    if (!handler.context) {
      handler.context = {userId: Date.now()} as WebSocketContextData;
    }
    return handler.context;
  },
);

export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    let handler =  ctx.getArgs().find(a => a instanceof WebSocket)
    return (handler.context as WebSocketContextData);
  },
);
