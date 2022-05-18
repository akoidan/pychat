import {
  Logger,
  Module,
} from "@nestjs/common";
import {RedisService} from "@/modules/shared/redis/redis.service";
import {PubsubService} from "@/modules/shared/pubsub/pubsub.service";
import {RedisModule} from "@nestjs-modules/ioredis";
import {config} from "node-ts-config";
import {RedisSubscribeService} from "@/modules/shared/pubsub/redis.subscribe.service";

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
      inject: [Logger, RedisService, RedisSubscribeService],
      useFactory: async(l: Logger, r: RedisService, rs: RedisSubscribeService) => {
        const ps = new PubsubService(l, r, rs);
        await ps.startListening();
        return ps;
      },
    },
  ],
  exports: [PubsubService]
})
export class PubsubModule {
}
