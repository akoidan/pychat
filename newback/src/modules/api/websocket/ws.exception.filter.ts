import type {
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
} from "@nestjs/common";
import {Catch} from "@nestjs/common";
import type {WebSocket} from "ws";
import { GrowlMessage } from '@/data/shared/ws.in.messages';

@Catch(Error) // If we provide it on module Websocket it will also affect http,so fuck it
// Since we can't decouple this from WebSocketGateway, it should be in this file
export class WsExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const cbId = host.getArgByIndex(1)?.cbId;
    if (cbId) {
      const response: GrowlMessage = {
        cbId,
        action: "growlError",
        content: exception.message,
        handler: "void",
      };
      const websocket: WebSocket = host.getArgByIndex(0);
      websocket.send(response);
    } else {
      throw exception;
    }
  }
}
