import {
  Logger,
  Module
} from '@nestjs/common';
import {AuthController} from '@/modules/api/auth/auth.controller';
import {AuthService} from '@/modules/api/auth/auth.service';
import {DatabaseModule} from '@/data/database/database.module';
import {RedisService} from '@/data/redis/RedisService';
import {EmailModule} from '@/modules/util/email/email.module';
import {GoogleAuthService} from '@/modules/api/auth/google.auth.service';
import {PasswordService} from '@/modules/api/auth/password.service';
import {OAuth2Client} from 'google-auth-library';
import {config} from 'node-ts-config';
import {HttpModule} from '@/modules/util/http/http.module';
import {FacebookAuthService} from '@/modules/api/auth/facebook.auth.service';
import {ConfigService} from '@/modules/util/config/config.service';

@Module({
  imports: [DatabaseModule, EmailModule, HttpModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    RedisService,
    FacebookAuthService,
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
