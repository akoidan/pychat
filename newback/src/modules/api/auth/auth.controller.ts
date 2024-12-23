import type {FacebookSignInResponse} from "@common/http/auth/facebook.sign.in";
import type {GoogleSignInResponse} from "@common/http/auth/google.sign.in";
import type {SignUpResponse} from "@common/http/auth/sign.up";
import type {SignInResponse} from "@common/http/auth/sign.in";
import type {ValidateUserResponse} from "@common/http/auth/validate.user";
import type {ValidateEmailResponse} from "@common/http/auth/validte.email";
import {
  Body,
  Controller,
  Ip,
  Post,
  UseGuards,
} from "@nestjs/common";
import {AuthService} from "@/modules/api/auth/auth.service";
import {LoginRequestValidator} from "@/modules/api/auth/validators/login.request.validator";
import {SignUpRequestValidator} from "@/modules/api/auth/validators/sign.up.request.validator";
import {ValidateUserRequestValidator} from "@/modules/api/auth/validators/validate.user.request.validator";

import {GoogleAuthRequestValidator} from "@/modules/api/auth/validators/google.auth.reques.validator";
import {CaptchaGuard} from "@/modules/app/guards/captcha.guard";
import {ValidateEmailRequestValidator} from "@/modules/api/auth/validators/validate.email.request.validator";
import {FacebookAuthRequestValidator} from "@/modules/api/auth/validators/facebook.auth.request.validator";


@Controller({
  path: "/api/auth",
})
export class AuthController {
  constructor(
    private readonly authservice: AuthService,
  ) {
  }

  @UseGuards(CaptchaGuard)
  @Post("/sign-in")
  public async auth(@Body() body: LoginRequestValidator): Promise<SignInResponse> {
    return this.authservice.authorize(body);
  }

  @Post("/google-sign-in")
  public async googleAuth(@Body() body: GoogleAuthRequestValidator): Promise<GoogleSignInResponse> {
    return this.authservice.authorizeGoogle(body);
  }

  @Post("/facebook-sign-in")
  public async facebookAuh(@Body() body: FacebookAuthRequestValidator): Promise<FacebookSignInResponse> {
    return this.authservice.authorizeFacebook(body);
  }

  @Post("/sign-up")
  public async register(@Body() body: SignUpRequestValidator, @Ip() ip): Promise<SignUpResponse> {
    return this.authservice.registerUser(body, ip);
  }

  @Post("/validate-email")
  public async validateEmail(@Body() body: ValidateEmailRequestValidator): Promise<ValidateEmailResponse> {
    await this.authservice.validateEmail(body.email);
    return {
      ok: true,
    };
  }

  @Post("/validate-user")
  public async validateUser(@Body() body: ValidateUserRequestValidator): Promise<ValidateUserResponse> {
    await this.authservice.validateUser(body.username);
    return {
      ok: true,
    };
  }
}
