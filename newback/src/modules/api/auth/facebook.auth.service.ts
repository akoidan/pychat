import {TokenPayload} from 'google-auth-library';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import {HttpService} from '@/modules/http/http.service';
import {ConfigService} from '@/modules/config/config.service';
import {FacebookGetUserResponse} from '@/data/types/api';

@Injectable()
export class FacebookAuthService {

  public constructor(
    private readonly logger: Logger,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {

  }

  public async validate(idToken: string): Promise<FacebookGetUserResponse> {
    let accessToken = this.configService.getConfig().auth?.facebook?.accessToken;
    if (!accessToken) {
      throw new ServiceUnavailableException("facebook access token is not specified");
    }
    const response = await this.httpService.getUrlEncoded(
      'https://graph.facebook.com/debug_token',
      {
        input_token: idToken,
        access_token: accessToken
      }
    );
    if (!response?.data) {
      throw new InternalServerErrorException("facebook api is down")
    }
    if (!response.data.is_valid) {
      if (response.data.error) {
        throw new BadRequestException(`facebook api error down error=${response.data.error.message} code=${response.data.error.code}`)
      } else {
        throw new InternalServerErrorException("invalid facebook response")
      }
    }
    let userId = response.data.user_id;
    this.logger.log(`got userId='${userId}' for facebookToken='${idToken}'`);
    if (!userId) {
      throw new InternalServerErrorException("invalid facebook response, userId is missing")
    }
    let facebookUser: FacebookGetUserResponse = await this.httpService.getUrlEncoded(`https://graph.facebook.com/${userId}`,
      {
        'access_token': accessToken,
        'fields': ['email', 'first_name', 'last_name'].join(',')
      }
    )
    if (!facebookUser.id) {
      throw new InternalServerErrorException("invalid facebook response, id is missing")
    }
    this.logger.log(`got userid='${facebookUser.id}' for facebookToken='${idToken}'`);
    return facebookUser;
  }
}
