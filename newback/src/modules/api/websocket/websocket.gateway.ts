import {
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {Server} from 'ws';

@WebSocketGateway({path: '/ws'})
export class EventsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  async handleConnection(socket: WebSocket) {
    console.log('socket.OPEN', socket.OPEN);
  }

  @SubscribeMessage('events')
  handleEvent(@MessageBody() data: string): any {
    const event = 'events';
    this.server.clients.forEach((client) => {
      client.send(JSON.stringify({event, data}));
    });
  }
}
