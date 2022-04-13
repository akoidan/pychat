import {
  BadRequestException,
  Injectable,
  Logger
} from '@nestjs/common';
import {HtmlService} from '@/modules/rest/html/html.service';
import {MailerService} from '@nestjs-modules/mailer';
import {ConfigService} from '@/modules/rest/config/config.service';
import {HttpService} from '@/modules/rest/http/http.service';
import {
  IP_FAIL,
  IpInfoResponse,
  IpSuccessInfoResponse
} from '@/data/types/api';
import {IpRepository} from '@/modules/rest/database/repository/ip.repository';
import {IpService} from '@/modules/rest/ip/ip.service';
import {IpAddressModel} from '@/data/model/ip.address.model';

@Injectable()
export class IpCacheService {
  public constructor(
    private readonly ipService: IpService,
    private readonly ipRepository: IpRepository,
    private readonly logger: Logger,
  ) {
  }

  public async getIpString(ip: string): Promise<string> {
    let data = await this.getIpInfo(ip);
    if (!data) {
      return "Unknown";
    } else {
      return `${data.country} ${data.city} ${data.isp}`;
    }
  }

  public async getIpInfo(ip: string): Promise<Partial<IpAddressModel>> {
    let response = await this.ipRepository.getIp(ip);
    if (response && !response.status) {
      return null;
    }
    try {
      let ipInfo = await this.ipService.getIpInfo(ip)
      let model: Partial<IpAddressModel> = {
        ip: ip,
        status: true,
        isp: ipInfo.isp,
        country: ipInfo.country,
        region: ipInfo.region,
        city: ipInfo.city,
        lat: ipInfo.lat,
        lon: ipInfo.lon,
        zip: ipInfo.zip,
        timezone: ipInfo.timezone
      };
      await this.ipRepository.saveIP(model)
      return model;
    } catch (e) {
      if (e.error == IP_FAIL) {
        await this.ipRepository.saveIP({ip, status: false})
        return null;
      }
      this.logger.error(`Unable to get Ip Address Info ${ip}`, e.stack, e.error)
      return null;
    }
  }

}
