import type {ExecutionContext} from "@nestjs/common";
import {createParamDecorator} from "@nestjs/common";
import {WebSocket} from "ws";
import type {WebSocketContextData} from "@/data/types/internal";

export const WsContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const handler = ctx.getArgs().find((a) => a instanceof WebSocket);
    return handler.context as WebSocketContextData;
  },
);

