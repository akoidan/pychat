import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {IncomingMessage} from 'http';
import {
  CatchWsErrors,
  UserId
} from '@/utils/decorators';
import {
  Server,
  WebSocket
} from 'ws';
import {WebSocketContextData} from '@/data/types/internal';
import {Logger} from '@nestjs/common';
import {SyncHistoryOutMessage} from '@/data/types/frontend';
import {SubscribePuBSub} from '@/modules/rest/pubsub/pubsub.service';
import {SendToClientPubSubMessage} from '@/modules/api/websocket/interfaces/pubsub';
import {WebsocketService} from '@/modules/api/websocket/websocket.service';

@WebSocketGateway({
  path: '/ws'
})
export class WebsocketGateway implements OnGatewayConnection {

  @WebSocketServer()
  public readonly server!: Server;

  constructor(
    public readonly logger: Logger,
    public readonly websocketService: WebsocketService,
  ) {
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
  syncHistory(@MessageBody() data: SyncHistoryOutMessage, @ConnectedSocket() a, @UserId() user): any {
  }

  @SubscribeMessage('printMessage')
  printMessage(@MessageBody() data: SyncHistoryOutMessage, @ConnectedSocket() a, @UserId() user): any {
  }

  @SubscribeMessage('getCountryCode')
  getCountryCode(@MessageBody() data: SyncHistoryOutMessage, @ConnectedSocket() a, @UserId() user): any {
  }

}
