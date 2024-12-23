import {
  Logger,
  Module,
} from "@nestjs/common";
import {RedisService} from "@/modules/shared/redis/redis.service";
import {PubsubService} from "@/modules/shared/pubsub/pubsub.service";
import {RedisModule} from "@nestjs-modules/ioredis";
import {config} from "node-ts-config";
import {RedisSubscribeService} from "@/modules/shared/pubsub/redis.subscribe.service";
import {ConfigService} from "@/modules/shared/config/config.service";

@Module({
  imports: [
    RedisModule.forRoot({
      config: {
        host: config.redis.host,
        port: config.redis.port,
        db: config.redis.database,
      },
    }, "pubsub"),
  ],
  providers: [
    RedisService,
    RedisSubscribeService,
    {
      provide: PubsubService,
      inject: [Logger, RedisService, RedisSubscribeService, ConfigService],
      useFactory: async(l: Logger, r: RedisService, rs: RedisSubscribeService, cs: ConfigService) => {
        const ps = new PubsubService(l, r, cs, rs);
        await ps.startListening();
        return ps;
      },
    },
  ],
  exports: [PubsubService],
})
export class PubsubModule {
}
