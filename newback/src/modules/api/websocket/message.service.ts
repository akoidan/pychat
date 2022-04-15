import {
  Injectable,
  Logger
} from '@nestjs/common';
import {UserRepository} from '@/modules/rest/database/repository/user.repository';
import {PasswordService} from '@/modules/rest/password/password.service';
import {ShowITypeRequestMessage} from '@/data/types/frontend';
import {RoomRepository} from '@/modules/rest/database/repository/room.repository';
import {IpCacheService} from '@/modules/rest/ip/ip.cache.service';
import {SessionService} from '@/modules/rest/session/session.service';
import {RedisService} from '@/modules/rest/redis/redis.service';
import {PubsubService} from '@/modules/rest/pubsub/pubsub.service';


@Injectable()
export class MessageService {

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

  public async showIType(request: ShowITypeRequestMessage) {
    // this.pubsubService.emit(
    //     'sendToClient',
    //     {
    //       content: getLogoutMessage(online, lastTimeOnline, context, lastTimeOnline),
    //     },
    //     '*'
    //   )
  }
}
