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

@Injectable()
export class IpService {
  public constructor(
    private readonly httpService: HttpService,
    private readonly loggerService: Logger,
  ) {
  }

  public async getIpFailSilenty(ip: string): Promise<IpSuccessInfoResponse|null> {
    try {
      let response = await this.getIpInfo(ip);
      return response; // await should be on top otherwise we won't catch errors
    } catch (e) {
      this.loggerService.error(`Failed to get info about ip ${ip}`);
      return null;
    }
  }

  public async getIpInfo(ip: string): Promise<IpSuccessInfoResponse> {
    let response = await this.httpService.getUrlEncoded<IpInfoResponse>(`http://ip-api.com/json/${ip}`);
    if (response?.status === 'fail') {
      throw new BadRequestException(`Ip='${ip}' error='${response.message}'`, IP_FAIL)
    }
    if (response.status !== 'success') {
      throw new BadRequestException('Unkown error')
    }
    return response;
  }

}
