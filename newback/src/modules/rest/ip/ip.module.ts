import {
  Global,
  Module
} from '@nestjs/common';
import {IpService} from '@/modules/rest/ip/ip.service';
import {IpCacheService} from '@/modules/rest/ip/ip.cache.service';
import {DatabaseModule} from '@/modules/rest/database/database.module';

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [IpService, IpCacheService],
  exports: [IpCacheService]
})
export class IpModule {
}
