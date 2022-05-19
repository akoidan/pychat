import type {WebsocketGateway} from "@/modules/api/websocket/websocket.gateway";
import {
  Injectable,
  Logger,
} from "@nestjs/common";
import type {
  PubSubHandlerType,
  PubSubMessage,
} from "@/data/types/internal";
import type {HandlerName} from "@common/ws/common";
import type {WebSocketContextData} from "@/data/types/patch";
import {RedisService} from "@/modules/shared/redis/redis.service";
import {RedisSubscribeService} from "@/modules/shared/pubsub/redis.subscribe.service";

export function SubscribePuBSub<T extends keyof WebsocketGateway>(handler: T) {
  return (target: WebsocketGateway, memberName: T, propertyDescriptor: PropertyDescriptor) => {
    PubsubService.handlers.push({
      handler,
      memberName,
      target,
    });
  };
}

@Injectable()
export class PubsubService {
  private receivers: Record<string, {ctx: WebSocketContextData}[]> = {};

  public static readonly handlers: PubSubHandlerType[] = [];

  private readonly subscribedChannel: string[] = [];

  constructor(
    private readonly logger: Logger,
    private readonly redis: RedisService,
    private readonly subscribeService: RedisSubscribeService,
  ) {
  }

  // A extends string,H extends HandlerName

  public async emit<PS extends PubSubMessage<A, H>, A extends string, H extends HandlerName>(data: PS, ...channel: (number | string)[]) {
    await this.redis.emit(channel[0] as any, data);
  }

  async startListening() {
    await this.subscribeService.onMessage((channel, message) => {
      this.onRedisMessage(channel, message as PubSubMessage<any, any>);
    });
  }

  public onRedisMessage(channel: string, data: PubSubMessage<any, any>) {
    if (this.receivers[channel]) {
      this.receivers[channel].forEach((receiver) => {
        const proxy = PubsubService.handlers.find((h) => h.handler === data.handler);
        if (!proxy) {
          throw Error(`Invalid handler ${data.handler}`);
        }
        (proxy.target[proxy.memberName] as any)(receiver.ctx, data.body);
      });
    }
  }

  public async subscribe(context: WebSocketContextData, ...channel: string[]) {
    const newChannels = channel.filter((c) => !this.subscribedChannel.includes(c));
    if (newChannels.length > 0) {
      await this.subscribeService.listen(newChannels);
    }
    channel.forEach((channel) => {
      if (!this.receivers[channel]) {
        this.receivers[channel] = [];
      }
      this.receivers[channel].push({
        ctx: context,
      });
    });
  }

  public unsubscribeAll(context: WebSocketContextData) {
    Object.values(this.receivers).forEach((contexts) => {
      const index = contexts.findIndex((c) => c.ctx = context);
      if (index >= 0) {
        contexts.splice(index, 1);
      }
    });
  }

  public unsubscribe(context: WebSocketContextData, ...channels: [string, ...string[]]) {
    channels.forEach((channel) => {
      if (this.receivers[channel]) {
        const index = this.receivers[channel].findIndex((c) => c.ctx = context);
        if (index >= 0) {
          this.receivers[channel].splice(index, 1);
        }
      }
    });
  }

  public getMyChannels(context: WebSocketContextData): string[] {
    return Object.entries(this.receivers).filter(([k, v]) => v.find((k) => k.ctx === context)).
      map(([k, v]) => k);
  }
}
