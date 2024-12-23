import {Module} from "@nestjs/common";
import {DatabaseModule} from "@/modules/shared/database/database.module";
import {RedisService} from "@/modules/shared/redis/redis.service";
import {EmailModule} from "@/modules/shared/email/email.module";
import {PasswordService} from "@/modules/shared/password/password.service";
import {HttpModule} from "@/modules/shared/http/http.module";
import {IpModule} from "@/modules/shared/ip/ip.module";
import {VerifyController} from "@/modules/api/verify/verify.controller";
import {SessionService} from "@/modules/shared/session/session.service";
import {VerifyService} from "@/modules/api/verify/verify.service";

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
