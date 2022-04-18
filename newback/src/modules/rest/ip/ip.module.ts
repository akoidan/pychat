import {
  Global,
  Module,
} from "@nestjs/common";
import {IpService} from "@/modules/rest/ip/ip.service";
import {IpCacheService} from "@/modules/rest/ip/ip.cache.service";
import {DatabaseModule} from "@/modules/rest/database/database.module";
import {RedisService} from "@/modules/rest/redis/redis.service";

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [IpService, IpCacheService, RedisService],
  exports: [IpCacheService],
})
export class IpModule {
}
