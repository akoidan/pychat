import {
  Body,
  Controller,
  HttpCode,
  Ip,
  Logger,
  Post,
  UseGuards
} from '@nestjs/common';
import {AuthService} from '@/modules/api/auth/auth.service';
import {LoginRequestValidator} from '@/modules/api/auth/validators/login.request.validator';
import {SignUpRequestValidator} from '@/modules/api/auth/validators/sign.up.request.validator';
import {ValidateUserRequestValidator} from '@/modules/api/auth/validators/validate.user.request.validator';
import {
  AcceptTokenResponse,
  FacebookSignInResponse,
  GoogleSignInResponse,
  SendRestorePasswordResponse,
  SignInResponse,
  SignUpResponse,
  ValidateUserEmailRequest,
  ValidateUserResponse
} from '@/data/types/frontend';
import {GoogleAuthRequestValidator} from '@/modules/api/auth/validators/google.auth.reques.validator';
import {CaptchaGuard} from '@/modules/captcha';
import {ValidateEmailRequestValidator} from '@/modules/api/auth/validators/validate.email.request.validator';
import {FacebookAuthRequestValidator} from '@/modules/api/auth/validators/facebook.auth.request.validator';
import {SendRestorePasswordValidator} from '@/modules/api/auth/validators/send.restore.password.validator';
import {VerifyTokenRequestValidator} from '@/modules/api/auth/validators/verify.token.request.validator';
import {VerifyTokenResponse} from '@/data/types/frontend';
import {AcceptTokenRequestValidator} from '@/modules/api/auth/validators/accept.token.request.validator';

@Controller({
  path: '/api/auth'
})
export class AuthController {
  constructor(
    private readonly authservice: AuthService,
    private readonly logger: Logger
  ) {
  }

  @UseGuards(CaptchaGuard)
  @Post('/sign-in')
  public async auth(@Body() body: LoginRequestValidator): Promise<SignInResponse> {
    return this.authservice.authorize(body);
  }

  @Post('/google-sign-in')
  public async googleAuth(@Body() body: GoogleAuthRequestValidator): Promise<GoogleSignInResponse> {
    return this.authservice.authorizeGoogle(body);
  }

  @Post('/facebook-sign-in')
  public async facebookAuh(@Body() body: FacebookAuthRequestValidator): Promise<FacebookSignInResponse> {
    return this.authservice.authorizeFacebook(body);
  }

  @Post('/sign-up')
  public async register(@Body() body: SignUpRequestValidator, @Ip() ip): Promise<SignUpResponse> {
    return this.authservice.registerUser(body, ip);
  }

  @Post('/validate-email')
  public async validateEmail(@Body() body: ValidateEmailRequestValidator): Promise<ValidateUserResponse> {
    await this.authservice.validateEmail(body.email);
    return {
      ok: true
    }
  }

 @UseGuards(CaptchaGuard)
 @Post('/send-restore-password')
  public async sendRestorePassword(@Body() body: SendRestorePasswordValidator, @Ip() ip: string): Promise<SendRestorePasswordResponse> {
    await this.authservice.sendRestorePassword(body, ip);
    return {
      ok: true
    }
  }

 @Post('/verify-token')
  public async verifyToken(@Body() body: VerifyTokenRequestValidator): Promise<VerifyTokenResponse> {
    return  this.authservice.verifyToken(body.token);
  }

 @Post('/accept-token')
  public async acceptToken(@Body() body: AcceptTokenRequestValidator): Promise<AcceptTokenResponse> {
    return  this.authservice.acceptToken(body);
  }

  @Post('/validate-user')
  public async validateUser(@Body() body: ValidateUserRequestValidator): Promise<ValidateUserResponse> {
    await this.authservice.validateUser(body.username);
    return {
      ok: true
    }
  }

}
