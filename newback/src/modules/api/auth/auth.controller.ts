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
  ConfirmEmailResponse,
  FacebookSignInResponse,
  GoogleSignInResponse,
  SendRestorePasswordResponse,
  SignInResponse,
  SignUpResponse,
  ValidateEmailResponse,
  ValidateUserEmailRequest,
  ValidateUserResponse
} from '@/data/types/frontend';
import {GoogleAuthRequestValidator} from '@/modules/api/auth/validators/google.auth.reques.validator';
import {CaptchaGuard} from '@/modules/app/guards/captcha.guard';
import {ValidateEmailRequestValidator} from '@/modules/api/auth/validators/validate.email.request.validator';
import {FacebookAuthRequestValidator} from '@/modules/api/auth/validators/facebook.auth.request.validator';


@Controller({
  path: '/api/auth'
})
export class AuthController {
  constructor(
    private readonly authservice: AuthService,
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
  public async validateEmail(@Body() body: ValidateEmailRequestValidator): Promise<ValidateEmailResponse> {
    await this.authservice.validateEmail(body.email);
    return {
      ok: true
    }
  }

  @Post('/validate-user')
  public async validateUser(@Body() body: ValidateUserRequestValidator): Promise<ValidateUserResponse> {
    await this.authservice.validateUser(body.username);
    return {
      ok: true
    }
  }

}
