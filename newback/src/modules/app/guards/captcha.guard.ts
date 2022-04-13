import {
	Injectable,
	CanActivate,
	ExecutionContext,
	BadRequestException,
	Logger,
	UnauthorizedException,

} from '@nestjs/common';

import {
	Recaptcha
} from 'node-ts-config';

import {ConfigService} from '@/modules/rest/config/config.service';
import {HttpService} from '@/modules/rest/http/http.service';
@Injectable()
export class CaptchaGuard implements CanActivate {
  constructor(
    private readonly logger: Logger,
		private readonly httpService: HttpService,
		private readonly configService: ConfigService,
  ) {
  }

  public async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    if (!this.configService.getConfig().recaptcha) {
      return true;
    }
    let captcha = context.switchToHttp().getRequest()?.body?.captcha;
    let ip = context.switchToHttp().getRequest()?.ip
    if (!captcha) {
      throw new BadRequestException("Captcha is missing");
    }

		let response = await this.httpService.postUrlEncoded("https://www.google.com/recaptcha/api/siteverify", {
			secret: this.configService.getConfig().recaptcha.privateKey,
			response: captcha,
			remoteip: ip
		});
		if (!response.success) {
			throw new UnauthorizedException(response && response['error-codes'] ? `Captcha error: ${response['error-codes'][0]}` : 'Unable to validate captcha');
		}
		return true;
  }
}
