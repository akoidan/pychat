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
  Logger,
  UseFilters
} from '@nestjs/common';
import {
  GetCountryCodeWsOutMessage,
  GetCountryCodeWsInMessage,
  ShowITypeWsInMessage,
  ShowITypeWsOutMessage,
  SyncHistoryOutMessage
} from '@/data/types/frontend';
import {SubscribePuBSub} from '@/modules/rest/pubsub/pubsub.service';
import {SendToClientPubSubMessage} from '@/modules/api/websocket/interfaces/pubsub';
import {WebsocketService} from '@/modules/api/websocket/websocket.service';
import {OnWsClose} from '@/modules/api/websocket/interfaces/utils';
import {WsDataService} from '@/modules/api/websocket/ws.data.service';
import {WsExceptionFilter} from '@/modules/api/websocket/ws.exception.filter';
import {MessageService} from '@/modules/api/websocket/message.service';

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
    public readonly messageService: MessageService,
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
    ctx.sendToClient(data.body);
  }

  @SubscribeMessage('syncHistory')
 public async  syncHistory(@MessageBody() data: SyncHistoryOutMessage, @WsContext() context: WebSocketContextData): Promise<any> {
    await this.messageService.syncHistory(data, context);
  }

  @SubscribeMessage('printMessage')
  public async  printMessage(@MessageBody() data: SyncHistoryOutMessage, @WsContext()  context: WebSocketContextData): Promise<any> {
  }

  @SubscribeMessage('showIType')
  public async showIType(@MessageBody() data: ShowITypeWsOutMessage, @WsContext()  context: WebSocketContextData): Promise<void> {
    await this.messageService.showIType(data, context);
  }


  @SubscribeMessage('getCountryCode')
  async getCountryCode(@MessageBody() data: GetCountryCodeWsOutMessage, @WsContext()  context: WebSocketContextData): Promise<Omit<GetCountryCodeWsInMessage, 'handler'|'action'>> {
    return this.wsDataService.getCountryCodes(context);
  }

}
