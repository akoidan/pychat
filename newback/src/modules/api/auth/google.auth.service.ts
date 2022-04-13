import {
  OAuth2Client,
  TokenPayload
} from 'google-auth-library';
import {
  ForbiddenException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';

@Injectable()
export class GoogleAuthService {

  public constructor(
    private readonly logger: Logger,
    private readonly oauth2Client: OAuth2Client | null,
  ) {

  }

  /**
   * {
   *    "iss": "accounts.google.com",
   *    "azp": "620421656154-xxxxxxxxxxxxxxx.apps.googleusercontent.com",
   *    "aud": "620421656154-xxxxxxxxxxxxxxx.apps.googleusercontent.com",
   *    "sub": "12313131312312",
   *    "email": "deathangel908@gmail.com",
   *    "email_verified": true,
   *    "at_hash": "xxxxxxxxxxxxxxx",
   *    "name": "Andrew Koidan",
   *    "picture": "https://lh3.googleusercontent.com/a-/xxxxxxx",
   *    "given_name": "Andrew",
   *    "family_name": "Koidan",
   *    "locale": "en",
   *    "iat": 1649759247,
   *    "exp": 1649759247,
   *    "jti": "xxxxxxxxxxxxxxxxxxxxxxxxx"
   * }
   * */
  public async validate(idToken: string): Promise<TokenPayload> {
    if (!this.oauth2Client) {
      throw new ServiceUnavailableException("google client id not specifed");
    }
    const response = await this.oauth2Client.verifyIdToken({
      idToken,
    });
    const payload = response.getPayload()!;
    if (!payload) {
      throw new ForbiddenException('Invalid google credentials')
    }
    return payload;
  }
}
