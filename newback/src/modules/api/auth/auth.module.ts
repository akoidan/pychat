import {
  Logger,
  Module
} from '@nestjs/common';
import {AuthController} from '@/modules/api/auth/auth.controller';
import {AuthService} from '@/modules/api/auth/auth.service';
import {DatabaseModule} from '@/data/database/database.module';
import {RedisService} from '@/data/redis/RedisService';
import {EmailModule} from '@/modules/email.render/email.module';
import {GoogleAuthService} from '@/modules/api/auth/google.auth.service';
import {PasswordService} from '@/modules/api/auth/password.service';
import {OAuth2Client} from 'google-auth-library';
import {config} from 'node-ts-config';
import {HttpModule} from '@/modules/http/http.module';

@Module({
  imports: [DatabaseModule, EmailModule, HttpModule],
  controllers: [AuthController],
  providers: [AuthService, PasswordService, RedisService, {
    provide: GoogleAuthService,
    useFactory: (logger) => {
      return new GoogleAuthService(logger, new OAuth2Client(
        config.auth.google.clientId,
      ))
    },
    inject: [Logger]
  }],
})
export class AuthModule {
}
