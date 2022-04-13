import {
  Body,
  Controller,
  Ip,
  Post,
  UseGuards
} from '@nestjs/common';
import {CaptchaGuard} from '@/modules/app/guards/captcha.guard';
import {SendRestorePasswordValidator} from '@/modules/api/verify/validators/send.restore.password.validator';
import {
  AcceptTokenResponse,
  ConfirmEmailResponse,
  SendRestorePasswordResponse,
  VerifyTokenResponse
} from '@/data/types/frontend';
import {VerifyTokenRequestValidator} from '@/modules/api/verify/validators/verify.token.request.validator';
import {ConfirmEmailRequestValidator} from '@/modules/api/verify/validators/confirm.email.request.validator';
import {AcceptTokenRequestValidator} from '@/modules/api/verify/validators/accept.token.request.validator';
import {VerifyService} from '@/modules/api/verify/verify.service';


@Controller({
  path: '/api/verify'
})
export class VerifyController {
  constructor(
    private readonly verifyService: VerifyService,
  ) {
  }

@UseGuards(CaptchaGuard)
 @Post('/send-restore-password')
  public async sendRestorePassword(@Body() body: SendRestorePasswordValidator, @Ip() ip: string): Promise<SendRestorePasswordResponse> {
    await this.verifyService.sendRestorePassword(body, ip);
    return {
      ok: true
    }
  }

 @Post('/verify-token')
  public async verifyToken(@Body() body: VerifyTokenRequestValidator): Promise<VerifyTokenResponse> {
    return  this.verifyService.verifyToken(body.token);
  }

  @Post('/confirm-email')
  public async confirmEmail(@Body() body: ConfirmEmailRequestValidator): Promise<ConfirmEmailResponse> {
    await this.verifyService.confirmEmail(body);
    return {
      ok: true,
    }
  }

 @Post('/accept-token')
  public async acceptToken(@Body() body: AcceptTokenRequestValidator): Promise<AcceptTokenResponse> {
    return this.verifyService.acceptToken(body);
  }
}
