import {
  Injectable,
  Logger,
} from "@nestjs/common";
import {
  InjectRedis,
  Redis,
} from "@nestjs-modules/ioredis";

@Injectable()
export class RedisSubscribeService {
  public constructor(

    /*
     * Once the client enters the subscribed state it is not supposed to issue any other commands,
     * except for additional SUBSCRIBE, PSUBSCRIBE, UNSUBSCRIBE and PUNSUBSCRIBE commands.
     */
    @InjectRedis("pubsub") private readonly redis: Redis,
    private readonly logger: Logger,
  ) {
  }

  public async onMessage(cb: (channel: string, message: unknown) => void): Promise<void> {
    return new Promise((resolve) => {
      this.redis.on("message", (channel: string, message: string) => {
        this.logger.debug(`Got on channel='${channel}' message='${message}'`, "redis");
        const data: unknown = JSON.parse(message);
        cb(channel, data);
      });
      resolve();
    });
  }


  public async listen(channels: (Buffer | string)[]): Promise<unknown> {
    return new Promise<unknown>((resolve, reject) => {
      this.logger.debug(`Listening channels=[${channels.join(", ")}]`, "redis");
      this.redis.subscribe(...channels, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
}
