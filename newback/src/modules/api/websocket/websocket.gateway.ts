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
  ArgumentMetadata,
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
  Logger,
  PipeTransform,
  UseFilters
} from '@nestjs/common';
import {
  GetCountryCodeResponseMessage,
  GrowlMessage,
  ShowITypeRequestMessage,
  SyncHistoryOutMessage
} from '@/data/types/frontend';
import {SubscribePuBSub} from '@/modules/rest/pubsub/pubsub.service';
import {SendToClientPubSubMessage} from '@/modules/api/websocket/interfaces/pubsub';
import {WebsocketService} from '@/modules/api/websocket/websocket.service';
import {OnWsClose} from '@/modules/api/websocket/interfaces/utils';
import {WsDataService} from '@/modules/api/websocket/ws.data.service';
import {WsExceptionFilter} from '@/modules/api/websocket/ws.exception.filter';
import {check} from 'typend';


@Injectable()
export class ValidationPipe implements PipeTransform<any, any> {


  constructor(private checker: (v: any) => void ) {

  }
  transform(value: string, metadata: ArgumentMetadata): any {
    this.checker(value);
    return value;
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

  @SubscribeMessage('showIType')
  showIType(@MessageBody(new ValidationPipe((v) => check<ShowITypeRequestMessage>(v))) data: SyncHistoryOutMessage, @WsContext() context): any {
    // return this.
  }


  @SubscribeMessage('getCountryCode')
  async getCountryCode(@MessageBody() data: GetCountryCodeResponseMessage, @WsContext() context): Promise<Omit<GetCountryCodeResponseMessage, 'handler'|'action'>> {
    return this.wsDataService.getCountryCodes(context);
  }

}
