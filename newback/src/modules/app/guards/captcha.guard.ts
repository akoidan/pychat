import type {
  CanActivate,
  ExecutionContext,
} from "@nestjs/common";
import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";

import {ConfigService} from "@/modules/rest/config/config.service";
import {HttpService} from "@/modules/rest/http/http.service";

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
    const captcha = context.switchToHttp().getRequest()?.body?.captcha;
    const ip = context.switchToHttp().getRequest()?.ip;
    if (!captcha) {
      throw new BadRequestException("Captcha is missing");
    }

    const response = await this.httpService.postUrlEncoded("https://www.google.com/recaptcha/api/siteverify", {
      secret: this.configService.getConfig().recaptcha.privateKey,
      response: captcha,
      remoteip: ip,
    });
    if (!response.success) {
      throw new UnauthorizedException(response && response["error-codes"] ? `Captcha error: ${response["error-codes"][0]}` : "Unable to validate captcha");
    }
    return true;
  }
}
