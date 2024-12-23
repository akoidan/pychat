import {
  Global,
  Module,
} from "@nestjs/common";
import {IpService} from "@/modules/shared/ip/ip.service";
import {IpCacheService} from "@/modules/shared/ip/ip.cache.service";
import {DatabaseModule} from "@/modules/shared/database/database.module";
import {RedisService} from "@/modules/shared/redis/redis.service";

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [IpService, IpCacheService, RedisService],
  exports: [IpCacheService],
})
export class IpModule {
}
