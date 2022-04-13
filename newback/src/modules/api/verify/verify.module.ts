import {Module} from '@nestjs/common';
import {DatabaseModule} from '@/modules/rest/database/database.module';
import {RedisService} from '@/modules/rest/redis/redis.service';
import {EmailModule} from '@/modules/rest/email/email.module';
import {PasswordService} from '@/modules/rest/password/password.service';
import {HttpModule} from '@/modules/rest/http/http.module';
import {IpModule} from '@/modules/rest/ip/ip.module';
import {VerifyController} from '@/modules/api/verify/verify.controller';
import {SessionService} from '@/modules/rest/session/session.service';
import {VerifyService} from '@/modules/api/verify/verify.service';

@Module({
  imports: [DatabaseModule, EmailModule, HttpModule, IpModule],
  controllers: [VerifyController],
  providers: [
    SessionService,
    VerifyService,
    PasswordService,
    RedisService,
  ],
})
export class VerifyModule {
}
