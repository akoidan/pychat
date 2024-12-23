import type {ExecutionContext} from "@nestjs/common";
import {createParamDecorator} from "@nestjs/common";
import {WebSocket} from "ws";

export const WsContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const handler: WebSocket = ctx.getArgs().find((a) => a instanceof WebSocket);
    return handler.context;
  },
);

