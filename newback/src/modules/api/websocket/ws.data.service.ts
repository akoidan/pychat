import {GetCountryCodeWsInMessage} from '@common/ws/message/get.country.code';
import {
  Injectable,
  Logger,
} from "@nestjs/common";
import {RoomRepository} from "@/modules/shared/database/repository/room.repository";
import {IpCacheService} from "@/modules/shared/ip/ip.cache.service";
import type {WebSocketContextData} from "@/data/types/internal";
import {ConfigService} from "@/modules/shared/config/config.service";
import {ValidationException} from "@/data/exceptions/validation.exception";
import type {UserJoinedInfoModel} from "@/data/model/user.joined.info.model";
import {transformUserCountries} from "@/data/transformers/out.message/get.user.contries.transformer";


@Injectable()
export class WsDataService {
  constructor(
    public readonly logger: Logger,
    private readonly configService: ConfigService,
    private readonly ipCacheService: IpCacheService,
    private readonly roomRepository: RoomRepository,
  ) {
  }

  public async getCountryCodes(context: WebSocketContextData): Promise<GetCountryCodeWsInMessage["data"]> {
    if (!this.configService.getConfig().settings.flags) {
      throw new ValidationException("Flags api is not enabled");
    }
    const usersId: number[] = await this.roomRepository.usersForUser(context.userId);
    const ips: UserJoinedInfoModel[] = await this.ipCacheService.getSavedIpsInfo();
    const filteredUsers = ips.filter((userInfo) => usersId.includes(userInfo.userId));
    return transformUserCountries(filteredUsers);
  }
}
