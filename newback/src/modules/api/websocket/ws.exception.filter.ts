import type {
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
} from "@nestjs/common";
import {Catch} from "@nestjs/common";
import {WebSocket} from "ws";
import {GrowlWsInMessage} from "@common/ws/message/growl.message";


@Catch(Error) // If we provide it on module Websocket it will also affect http,so fuck it
// Since we can't decouple this from WebSocketGateway, it should be in this file
export class WsExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const cbId = host.getArgByIndex(1)?.cbId;
    let websocket: WebSocket = host.getArgByIndex(0);
    if (cbId) {
      const response: GrowlWsInMessage = {
        cbId,
        cbBySender: websocket.context.id,
        action: "growlError",
        data: {
          error: exception.message,
        },
      };
      websocket.send(response);
    } else {
      throw exception;
    }
  }
}
