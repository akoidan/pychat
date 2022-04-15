import {
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {IncomingMessage} from 'http';
import {
  CatchWsErrors,
  WsContext
} from '@/utils/decorators';
import {
  Server,
  WebSocket
} from 'ws';
import {WebSocketContextData} from '@/data/types/internal';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
  UseFilters
} from '@nestjs/common';
import {
  GetCountryCodeResponseMessage,
  GrowlMessage,
  SyncHistoryOutMessage
} from '@/data/types/frontend';
import {SubscribePuBSub} from '@/modules/rest/pubsub/pubsub.service';
import {SendToClientPubSubMessage} from '@/modules/api/websocket/interfaces/pubsub';
import {WebsocketService} from '@/modules/api/websocket/websocket.service';
import {OnWsClose} from '@/modules/api/websocket/interfaces/utils';
import {WsDataService} from '@/modules/api/websocket/ws.data.service';



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

@WebSocketGateway({
  path: '/ws'
})
@UseFilters(new WsExceptionFilter())
export class WebsocketGateway implements OnGatewayConnection, OnWsClose {

  @WebSocketServer()
  public readonly server!: Server;

  constructor(
    public readonly logger: Logger,
    public readonly websocketService: WebsocketService,
    public readonly wsDataService: WsDataService,
  ) {
  }

  @SubscribeMessage('closeConnection')
  public async closeConnection(@WsContext() context: WebSocketContextData) {
    await this.websocketService.closeConnection(context)
  }

  @CatchWsErrors
  async handleConnection(socket: WebSocket, message: IncomingMessage, context: WebSocketContextData) {
    await this.websocketService.handleConnection(message.url, context, (socket as any)._socket.remoteAddress)
  }

  @SubscribePuBSub('sendToClient')
  public sendToClient(ctx: WebSocketContextData, data: SendToClientPubSubMessage<any, any, any>) {
    ctx.sendToClient(data.content);
  }

  @SubscribeMessage('syncHistory')
  syncHistory(@MessageBody() data: SyncHistoryOutMessage, /*@ConnectedSocket() a*/ @WsContext() context): any {
  }

  @SubscribeMessage('printMessage')
  printMessage(@MessageBody() data: SyncHistoryOutMessage, @WsContext() context): any {
  }

  @SubscribeMessage('getCountryCode')
  async getCountryCode(@MessageBody() data: GetCountryCodeResponseMessage, @WsContext() context): Promise<Omit<GetCountryCodeResponseMessage, 'handler'|'action'>> {
    return this.wsDataService.getCountryCodes(context);
  }

}
