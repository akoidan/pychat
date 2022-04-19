import {Injectable} from "@nestjs/common";
import {HttpService} from "@/modules/shared/http/http.service";
import type {
  IpInfoResponse,
  IpSuccessInfoResponse,
} from "@/data/types/api";
import {InvalidIpException} from "@/data/exceptions/invalid.ip.exception";

@Injectable()
export class IpService {
  public constructor(
    private readonly httpService: HttpService,
  ) {
  }

  public async getIpInfo(ip: string): Promise<IpSuccessInfoResponse> {
    const response = await this.httpService.getUrlEncoded<IpInfoResponse>(`http://ip-api.com/json/${ip}`);
    if (response?.status === "fail") {
      throw new InvalidIpException(ip, response.message, false);
    }
    if (response.status !== "success") {
      throw new InvalidIpException(ip, "Unknown", true);
    }
    return response;
  }
}