import {
  Injectable,
  Logger
} from '@nestjs/common';
import {UserRepository} from '@/modules/rest/database/repository/user.repository';
import {PasswordService} from '@/modules/rest/password/password.service';
import {
  GetCountryCodeWsInMessage,
  LocationDto
} from '@/data/types/frontend';
import {RoomRepository} from '@/modules/rest/database/repository/room.repository';
import {IpCacheService} from '@/modules/rest/ip/ip.cache.service';
import {WebSocketContextData} from '@/data/types/internal';
import {RedisService} from '@/modules/rest/redis/redis.service';
import {PubsubService} from '@/modules/rest/pubsub/pubsub.service';
import {ConfigService} from '@/modules/rest/config/config.service';
import {ValidationException} from '@/data/exceptions/validation.exception';
import {IpRepository} from '@/modules/rest/database/repository/ip.repository';
import {UserJoinedInfoModel} from '@/data/model/user.joined.info.model';


@Injectable()
export class WsDataService {

  constructor(
    public readonly logger: Logger,
    private readonly configService: ConfigService,
    private readonly passwordService: PasswordService,
    private readonly ipCacheService: IpCacheService,
    private readonly redisService: RedisService,
    private readonly ipRepository: IpRepository,
    private readonly roomRepository: RoomRepository,
    private readonly userRepository: UserRepository,
    private readonly pubsubService: PubsubService,
  ) {
  }

  public async getCountryCodes(context: WebSocketContextData): Promise<Omit<GetCountryCodeWsInMessage, 'handler'| 'action'>> {
    if (!this.configService.getConfig().settings.flags) {
      throw new ValidationException('Flags api is not enabled');
    }
    let usersId: number[] = await this.roomRepository.usersForUser(context.userId);
    let userInfo: UserJoinedInfoModel[] = await this.ipRepository.getIpInfosForUsers(usersId);
    let content: GetCountryCodeWsInMessage['content'] =userInfo.reduce((previousValue, currentValue) => {
      if (currentValue.ip) {
        let value: LocationDto = {
          country: currentValue.ip.country,
          region: currentValue.ip.region,
          city: currentValue.ip.city,
          countryCode: currentValue.ip.countryCode
        }
        previousValue[currentValue.userId] = value;
      }
      return previousValue;
    }, {})
    return {
      content,
    }
  }

}
