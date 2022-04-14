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
import {RedisService} from '@/modules/rest/redis/redis.service';
import {UserRepository} from '@/modules/rest/database/repository/user.repository';
import {SessionService} from '@/modules/rest/session/session.service';
import {UserModel} from '@/data/model/user.model';
import {PasswordService} from '@/modules/rest/password/password.service';
import {IpCacheService} from '@/modules/rest/ip/ip.cache.service';
import {RoomRepository} from '@/modules/rest/database/repository/room.repository';
import {transformSetWsId} from '@/modules/api/websocket/ws.transformer';
import {Logger} from '@nestjs/common';
import {
  AddOnlineUserMessage,
  SyncHistoryOutMessage
} from '@/data/types/frontend';
import {
  PubsubService,
  Subscribe
} from '@/modules/rest/pubsub/pubsub.service';


@WebSocketGateway({
  path: '/ws'
})
export class WebsocketGateway implements OnGatewayConnection {

  @WebSocketServer()
  public readonly server!: Server;

  constructor(
    public readonly logger: Logger,
    private readonly sessionService: SessionService,
    private readonly passwordService: PasswordService,
    private readonly ipCacheService: IpCacheService,
    private readonly redisService: RedisService,
    private readonly roomRepository: RoomRepository,
    private readonly userRepository: UserRepository,
    private readonly pubsubService: PubsubService,
  ) {
  }


  @CatchWsErrors
  async handleConnection(socket: WebSocket, message: IncomingMessage, context: WebSocketContextData) {
    context.socket = socket;
    let url = new URLSearchParams(message.url);
    let user: UserModel = await this.sessionService.getUserById(url.get('sessionId'));
    let id = await this.passwordService.createWsId(user.id, url.get('id'));
    let ip = (socket as any)._socket.remoteAddress;
    await this.ipCacheService.saveIp(user.id, ip);
    await this.redisService.addOnline(id)
    let online = await this.redisService.getOnline();

    let myRooms = await this.roomRepository.getRoomsForUser(user.id);
    let channelIds = myRooms.map(r => r.channelId).filter(c => c)
    let channels = await this.roomRepository.getAllChannels(channelIds);
    let allUsersInTheseRooms = await this.roomRepository.getRoomUsers(myRooms.map(r => r.id));
    let userIds: number[] = [...new Set(allUsersInTheseRooms.map(r => r.userId))];
    let users: UserModel[] = await this.userRepository.getUsersById(userIds);
    let response = transformSetWsId(
      {
        id,
        allUsersInTheseRooms,
        online,
        myRooms,
        users,
        user,
        channels,
        time: Date.now()
      }
    )
    context.userId = user.id;
    context.id = user.id;

    let channelsToListen = [...myRooms.map(r => String(r.id)), id, `u${user.id}`, '*'];
    this.logger.log(`User #${user.id} ${user.username} subscribed to ${JSON.stringify(channelsToListen)}`);
    socket.send(JSON.stringify(response));
    this.pubsubService.subscribe(context, ...channelsToListen)
    this.pubsubService.emit(
      'addOnlineUser',
      {
        online: response.online,
        userId: user.id,
        lastTimeOnline: user.lastTimeOnline,
        time: Date.now(),
        opponentWsId: '0002:lMKO'
      },
      '*'
    )
  }

  @Subscribe('addOnlineUser')
  public onLogin(ctx: WebSocketContextData, data: any) {
    let message: AddOnlineUserMessage = {
      action: 'addOnlineUser',
      handler: 'room',
      online: data.online,
      lastTimeOnline: data.lastTimeOnline,
      userId: data.userId,
      time: data.time,
      opponentWsId: data.opponentWsId,
    }
    ctx.socket.send(JSON.stringify(message))
  }

  @SubscribeMessage('syncHistory') //ws.ws.send(JSON.stringify({action: 'hello'}))
  syncHistory(@MessageBody() data: SyncHistoryOutMessage, @ConnectedSocket() a, @UserId() user): any {
    console.log(user);
  }

  @SubscribeMessage('getCountryCode') //ws.ws.send(JSON.stringify({action: 'hello'}))
  getCountryCode(@MessageBody() data: SyncHistoryOutMessage, @ConnectedSocket() a, @UserId() user): any {
    console.log(user);
  }
}
