import {
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import {IncomingMessage} from 'http';
import {UserId} from '@/utils/decorators';
import {WebSocket} from 'ws';
import {WebSocketContextData} from '@/data/types/internal';
import {RedisService} from '@/modules/rest/redis/redis.service';
import {UserRepository} from '@/modules/rest/database/repository/user.repository';
import {SessionService} from '@/modules/rest/session/session.service';
import {UserModel} from '@/data/model/user.model';
import {PasswordService} from '@/modules/rest/password/password.service';
import {IpCacheService} from '@/modules/rest/ip/ip.cache.service';
import {
  ChannelDto,
  RoomDto,
  SetWsIdMessage,
  UserDto
} from '@/data/types/frontend';
import {RoomRepository} from '@/modules/rest/database/repository/room.repository';
import {transformSetWsId} from '@/modules/api/websocket/ws.transformer';

@WebSocketGateway({
  path: '/ws'
})
export class WebsocketGateway implements OnGatewayConnection {

  constructor(
    private readonly sessionService: SessionService,
    private readonly passwordService: PasswordService,
    private readonly ipCacheService: IpCacheService,
    private readonly redisService: RedisService,
    private readonly roomRepository: RoomRepository,
    private readonly userRepository: UserRepository,
  ) {
  }

  async handleConnection(socket: WebSocket, message: IncomingMessage, context: WebSocketContextData) {
    let url = new URLSearchParams(message.url);
    let user: UserModel = await this.sessionService.getUserById(url.get('sessionId'));
    let id = await this.passwordService.createWsId(user.id,  url.get('id'));
    let ip = (socket as any)._socket.remoteAddress;
    await this.ipCacheService.saveIp(user.id, ip);
    await this.redisService.addOnline(id)
    let online = await this.redisService.getOnline();

    let myRooms = await this.roomRepository.getRoomsForUser(user.id);
    let channelIds = myRooms.map(r => r.channelId).filter(c => c)
    let channels = await this.roomRepository.getAllChannels(channelIds);
    let allUsersInTheseRooms = await this.roomRepository.getRoomUsers(myRooms.map(r => r.id));
    let userIds: number[] =  [...new Set(allUsersInTheseRooms.map(r => r.userId))];
    let users: UserModel[] =  await this.userRepository.getUsersById(userIds);
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
    socket.send(JSON.stringify(response));
  }

  @SubscribeMessage('hello') //ws.ws.send(JSON.stringify({action: 'hello'}))
  handleEvent(@MessageBody() data: string, @UserId() user): any {
    console.log(user);
    // const event = 'events';
    // this.server.clients.forEach((client) => {
    //   client.send(JSON.stringify({event, data}));
    // });
    return "asda";
  }

  @SubscribeMessage('hey') //ws.ws.send(JSON.stringify({action: 'hello'}))
  handleHey(@MessageBody() data: string) {
    console.log('asd2');
    // const event = 'events';
    // this.server.clients.forEach((client) => {
    //   client.send(JSON.stringify({event, data}));
    // });
  }
}
