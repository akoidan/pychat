import {
  Injectable,
  Logger,
} from "@nestjs/common";
import {UserRepository} from "@/modules/shared/database/repository/user.repository";
import {PasswordService} from "@/modules/shared/password/password.service";
import {RoomRepository} from "@/modules/shared/database/repository/room.repository";
import {IpCacheService} from "@/modules/shared/ip/ip.cache.service";
import {SessionService} from "@/modules/shared/session/session.service";
import type {UserModel} from "@/data/model/user.model";
import {RedisService} from "@/modules/shared/redis/redis.service";
import {PubsubService} from "@/modules/shared/pubsub/pubsub.service";
import {transformSetWsId} from "@/data/transformers/out.message/set.ws.id.transformer";
import {transformAddUserOnline} from "@/data/transformers/out.message/add.online.user.transformer";
import {getLogoutMessage} from "@/data/transformers/out.message/remove.online.user.transformer";
import type {AddOnlineUserMessage} from "@common/ws/message/add.online.user";
import type {WebSocketContextData} from "@/data/types/patch";


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
    const url = new URLSearchParams(urlString);
    const user: UserModel = await this.sessionService.getUserBySessionId(url.get("sessionId"));
    const id = await this.passwordService.createWsId(user.id, url.get("id"));
    context.userId = user.id;
    context.id = id;
    await this.ipCacheService.saveIp(user.id, ip);
    await this.redisService.addOnline(id);
    const online = await this.redisService.getOnline();

    const myRooms = await this.roomRepository.getRoomsForUser(user.id);
    const channelIds = myRooms.map((r) => r.channelId).filter((c) => c);
    const allUsersInTheseRooms = await this.roomRepository.getRoomUsers(myRooms.map((r) => r.id));
    const userIds: number[] = [...new Set(allUsersInTheseRooms.map((r) => r.userId))];
    const channels = await this.roomRepository.getAllChannels(channelIds);
    const users: UserModel[] = await this.userRepository.getUsersById(userIds);
    const response = transformSetWsId(
      {
        id,
        allUsersInTheseRooms,
        online,
        myRooms,
        users,
        user,
        channels,
        time: Date.now(),
      }
    );

    const channelsToListen = [...myRooms.map((r) => String(r.id)), id, `u${user.id}`, "*"];
    this.logger.log(`User #${user.id} ${user.username} subscribed to ${JSON.stringify(channelsToListen)}`, "ws");
    context.sendToClient(response);
    this.pubsubService.subscribe(context, ...channelsToListen);
    const data: AddOnlineUserMessage = transformAddUserOnline(online, user, id);
    await this.pubsubService.emit(
      {
        handler: "sendToClient",
        body: data,
      },
      "*"
    );
  }

  public async closeConnection(context: WebSocketContextData) {
    this.pubsubService.unsubscribeAll(context);
    if (context.id) {
      await this.redisService.removeOnline(context.id);
    }
    const online = await this.redisService.getOnline();
    if (context.userId && !online[context.userId]) {
      const lastTimeOnline: number = Date.now();
      await this.userRepository.setLastTimeOnline(context.userId, lastTimeOnline);
      await this.pubsubService.emit(
        {
          handler: "sendToClient",
          body: getLogoutMessage(online, lastTimeOnline, context, lastTimeOnline),
        },
        "*"
      );
    }
  }
}
