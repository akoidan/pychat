import {
  Logger,
  Module
} from '@nestjs/common';
import {AuthController} from '@/modules/api/auth/auth.controller';
import {AuthService} from '@/modules/api/auth/auth.service';
import {DatabaseModule} from '@/modules/rest/database/database.module';
import {RedisService} from '@/modules/rest/redis/redis.service';
import {EmailModule} from '@/modules/rest/email/email.module';
import {GoogleAuthService} from '@/modules/api/auth/google.auth.service';
import {PasswordService} from '@/modules/rest/password/password.service';
import {OAuth2Client} from 'google-auth-library';
import {config} from 'node-ts-config';
import {HttpModule} from '@/modules/rest/http/http.module';
import {FacebookAuthService} from '@/modules/api/auth/facebook.auth.service';
import {ConfigService} from '@/modules/rest/config/config.service';
import {IpModule} from '@/modules/rest/ip/ip.module';
import {SessionService} from '@/modules/rest/session/session.service';

@Module({
  imports: [DatabaseModule, EmailModule, HttpModule, IpModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    RedisService,
    FacebookAuthService,
    SessionService,
    {
      provide: GoogleAuthService,
      useFactory: (logger) => {
        return new GoogleAuthService(logger, config.auth?.google?.clientId ? new OAuth2Client(
          config.auth.google.clientId,
        ): null)
      },
      inject: [Logger, ConfigService]
    },
  ],
})
export class AuthModule {
}
