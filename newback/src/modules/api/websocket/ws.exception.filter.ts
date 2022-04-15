import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException
} from '@nestjs/common';
import {WebSocket} from 'ws';
import {GrowlMessage} from '@/data/types/frontend';

@Catch(Error)  // if we provide it on module Websocket it will also affect http,so fuck it
// since we can't decouple this from WebSocketGateway, it should be in this file
export class WsExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    let cbId = host.getArgByIndex(1)?.cbId;
    if (cbId) {
      let response: GrowlMessage = {
          cbId: cbId,
          action: 'growlError',
          content: exception.message,
          handler: 'void',
        }
      let websocket: WebSocket = host.getArgByIndex(0);
      websocket.send(response);
    } else {
      throw exception;
    }
  }
}
