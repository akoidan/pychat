import {
  Body,
  Controller,
  Get,
  Post
} from '@nestjs/common';
import { AuthService } from '@/modules/auth/auth.service';
import LoginRequestValidator from '@/modules/auth/interfaces';

@Controller()
export class AuthController {
  constructor(private readonly appService: AuthService) {}

  @Post('/auth')
  public auth(@Body() body: LoginRequestValidator): string {
    return 'asd';
  }
}
