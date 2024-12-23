import {
  Injectable,
  Logger,
} from "@nestjs/common";
import {IpRepository} from "@/modules/shared/database/repository/ip.repository";
import {IpService} from "@/modules/shared/ip/ip.service";
import type {IpAddressModel} from "@/data/model/ip.address.model";

import type {InvalidIpException} from "@/data/exceptions/invalid.ip.exception";
import {RedisService} from "@/modules/shared/redis/redis.service";
import type {UserJoinedInfoModel} from "@/data/model/user.joined.info.model";
import type {CreateModel} from "@/data/types/internal";

@Injectable()
export class IpCacheService {
  private inited: boolean = false;

  public constructor(
    private readonly ipService: IpService,
    private readonly ipRepository: IpRepository,
    private readonly logger: Logger,
    private readonly redisService: RedisService
  ) {
    this.ipRepository.connectCreateHook(async() => this.redisService.setIps(null));
  }

  public async getSavedIpsInfo(): Promise<UserJoinedInfoModel[]> {
    let ips = await this.redisService.getIps();
    if (!ips || !this.inited) {
      ips = await this.ipRepository.getAllIps();
      await this.redisService.setIps(ips);
      this.inited = true;
    }
    return ips;
  }

  public async getIpString(ip: string): Promise<string> {
    const data = await this.getIpInfo(ip);
    if (!data) {
      return "Unknown";
    }
    return `${data.country} ${data.city} ${data.isp}`;
  }

  public async saveIp(userId: number, ip: string) {
    const ipModel = await this.getIpInfo(ip);
    if (ipModel) {
      await this.ipRepository.saveIpToUser(userId, ipModel.id);
    }
  }

  public async getIpInfo(ip: string): Promise<IpAddressModel> {
    const response = await this.ipRepository.getIp(ip);
    if (response && !response.status) {
      return null;
    }
    try {
      const ipInfo = await this.ipService.getIpInfo(ip);
      const model: CreateModel<IpAddressModel> = {
        ip,
        status: true,
        isp: ipInfo.isp,
        country: ipInfo.country,
        region: ipInfo.region,
        city: ipInfo.city,
        lat: ipInfo.lat,
        lon: ipInfo.lon,
        zip: ipInfo.zip,
        timezone: ipInfo.timezone,
        countryCode: ipInfo.countryCode,
      };
      return await this.ipRepository.saveIP(model);
    } catch (e: any) {
      this.logger.error(`Unable to get Ip Address Info ${ip} ${e.error}`, e.stack, "ip.cache.service");
      if (!(e as InvalidIpException).networkError) {
        await this.ipRepository.saveIP({
          ip,
          status: false,
          countryCode: null,
          city: null,
          isp: null,
          lon: null,
          region: null,
          lat: null,
          zip: null,
          country: null,
          timezone: null,
        });
        return null;
      }
      return null;
    }
  }
}
