import {
  Body,
  ConflictException,
  Controller,
  Logger,
  Post
} from '@nestjs/common';
import {AuthService} from '@/modules/auth/auth.service';
import {LoginRequestValidator} from '@/modules/auth/validators/login.request.validator';
import {SignUpRequestValidator} from '@/modules/auth/validators/sign.up.request.validator';
import {ValidateUserRequestValidator} from '@/modules/auth/validators/validate.user.request.validator';
import {SignUpResponse} from '@/data/types/dto/dto';

@Controller()
export class AuthController {
  constructor(
    private readonly appService: AuthService,
    private readonly logger: Logger
  ) {}

  @Post('/auth')
  public auth(@Body() body: LoginRequestValidator): string {
    return 'asd';
  }

  @Post('/register')
  public register(@Body() body: SignUpRequestValidator): SignUpResponse {
    return this.appService.registerUser(body);
  }


  @Post('/validate_user')
  public async validateUser(@Body() body: ValidateUserRequestValidator): Promise<void> {
    await this.appService.validateUser(body.username);
  }


}
