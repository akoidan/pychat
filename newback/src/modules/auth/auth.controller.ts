import {
  Body,
  Controller,
  HttpCode,
  Ip,
  Logger,
  Post
} from '@nestjs/common';
import {AuthService} from '@/modules/auth/auth.service';
import {LoginRequestValidator} from '@/modules/auth/validators/login.request.validator';
import {SignUpRequestValidator} from '@/modules/auth/validators/sign.up.request.validator';
import {ValidateUserRequestValidator} from '@/modules/auth/validators/validate.user.request.validator';
import {
  SignInResponse,
  SignUpResponse
} from '@/data/types/dto/dto';

@Controller()
export class AuthController {
  constructor(
    private readonly authservice: AuthService,
    private readonly logger: Logger
  ) {
  }

  @Post('/auth')
  public async auth(@Body() body: LoginRequestValidator): Promise<SignInResponse> {
    return this.authservice.authorize(body);
  }

  @Post('/register')
  public async register(@Body() body: SignUpRequestValidator, @Ip() ip): Promise<SignUpResponse> {
    return this.authservice.registerUser(body, ip);
  }


  @Post('/validate_user')
  public async validateUser(@Body() body: ValidateUserRequestValidator): Promise<void> {
    await this.authservice.validateUser(body.username);
  }

}
