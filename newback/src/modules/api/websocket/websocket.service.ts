import {
  Injectable,
  Logger
} from '@nestjs/common';
import {UserRepository} from '@/modules/rest/database/repository/user.repository';
import {PasswordService} from '@/modules/rest/password/password.service';
import {AddOnlineUserMessage} from '@/data/types/frontend';
import {RoomRepository} from '@/modules/rest/database/repository/room.repository';
import {IpCacheService} from '@/modules/rest/ip/ip.cache.service';
import {SessionService} from '@/modules/rest/session/session.service';
import {UserModel} from '@/data/model/user.model';
import {
  getLogoutMessage,
  transformAddUserOnline,
  transformSetWsId
} from '@/modules/api/websocket/transformers/ws.transformer';
import {WebSocketContextData} from '@/data/types/internal';
import {RedisService} from '@/modules/rest/redis/redis.service';
import {PubsubService} from '@/modules/rest/pubsub/pubsub.service';


@Injectable()
export class WebsocketService {

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

  public async handleConnection(urlString: string, context: WebSocketContextData, ip: any) {
    let url = new URLSearchParams(urlString);
    let user: UserModel = await this.sessionService.getUserById(url.get('sessionId'));
    let id = await this.passwordService.createWsId(user.id, url.get('id'));
    context.userId = user.id;
    context.id = id;
    await this.ipCacheService.saveIp(user.id, ip);
    await this.redisService.addOnline(id)
    let online = await this.redisService.getOnline();

    let myRooms = await this.roomRepository.getRoomsForUser(user.id);
    let channelIds = myRooms.map(r => r.channelId).filter(c => c)
    let allUsersInTheseRooms = await this.roomRepository.getRoomUsers(myRooms.map(r => r.id));
    let userIds: number[] = [...new Set(allUsersInTheseRooms.map(r => r.userId))];
    let channels = await this.roomRepository.getAllChannels(channelIds);
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

    let channelsToListen = [...myRooms.map(r => String(r.id)), id, `u${user.id}`, '*'];
    this.logger.log(`User #${user.id} ${user.username} subscribed to ${JSON.stringify(channelsToListen)}`, 'ws');
    context.sendToClient(response)
    this.pubsubService.subscribe(context, ...channelsToListen);
    let data: AddOnlineUserMessage = transformAddUserOnline(response.online, user, id);
    this.pubsubService.emit(
      'sendToClient',
      {
        body: data,
      },
      '*'
    )
  }

  public async closeConnection(context: WebSocketContextData) {
    this.pubsubService.unsubscribe(context);
    if (context.id) {
      await this.redisService.removeOnline(context.id)
    }
    let online = await this.redisService.getOnline();
    if (context.userId && !online[context.userId]) {
      let lastTimeOnline: number = Date.now();
      await this.userRepository.setLastTimeOnline(context.userId, lastTimeOnline);
      this.pubsubService.emit(
        'sendToClient',
        {
          body: getLogoutMessage(online, lastTimeOnline, context, lastTimeOnline),
        },
        '*'
      )
    }
  }
}
