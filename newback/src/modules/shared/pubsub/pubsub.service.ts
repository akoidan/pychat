import type {WebsocketGateway} from "@/modules/api/websocket/websocket.gateway";
import {
  Injectable,
  Logger,
} from "@nestjs/common";
import type {
  PubSubMessage,
  WebSocketContextData,
} from "@/data/types/internal";


interface HandlerType {
  target: WebsocketGateway;
  memberName: keyof WebsocketGateway;
  handler: string;
}

const handlers: HandlerType[] = [];


/*
 * Function stateDecoratorFactory<TPT extends VuexModule>(vuexModule: TPT):
 * <TCT extends (TCT[TPN] extends TPT[TPN] ? unknown : never), TPN extends (keyof TCT & keyof TPT)>
 * (vueComponent: TCT, fileName: TPN) => void {
 *   return <TCT extends (TCT[TPN] extends TPT[TPN] ? unknown : never), TPN extends (keyof TCT & keyof TPT)>
 *   (vueComponent: TCT, fileName: TPN):
 *
 */
export function SubscribePuBSub<T extends keyof WebsocketGateway>(handler: T) {
  return (target: WebsocketGateway, memberName: T, propertyDescriptor: PropertyDescriptor) => {
    handlers.push({
      handler,
      memberName,
      target,
    });
  };
}

const receivers: Record<string, {ctx: WebSocketContextData}[]> = {};

@Injectable()
export class PubsubService {
  constructor(
    private readonly logger: Logger,
  ) {
  }

  // A extends string,H extends HandlerName

  public emit<PS extends PubSubMessage<A, H>, A extends string, H extends HandlerName>(handler: keyof WebsocketGateway, data: PS, ...channel: (number | string)[]) {
    channel.forEach((channel) => {
      if (receivers[channel]) {
        receivers[channel].forEach((receiver) => {
          const proxy = handlers.find((h) => h.handler === handler);
          (proxy.target[proxy.memberName] as any)(receiver.ctx, data);
        });
      }
    });
  }

  public subscribe(context: WebSocketContextData, ...channel: string[]) {
    channel.forEach((channel) => {
      if (!receivers[channel]) {
        receivers[channel] = [];
      }
      receivers[channel].push({
        ctx: context,
      });
    });
  }

  public unsubscribeAll(context: WebSocketContextData) {
    Object.values(receivers).forEach((contexts) => {
      const index = contexts.findIndex((c) => c.ctx = context);
      if (index >= 0) {
        contexts.splice(index, 1);
      }
    });
  }

  public unsubscribe(context: WebSocketContextData, ...channels: [string, ...string[]]) {
    channels.forEach((channel) => {
      if (receivers[channel]) {
        const index = receivers[channel].findIndex((c) => c.ctx = context);
        if (index >= 0) {
          receivers[channel].splice(index, 1);
        }
      }
    });
  }

  public getMyChannels(context: WebSocketContextData): string[] {
    return Object.entries(receivers).filter(([k, v]) => v.find((k) => k.ctx === context)).
      map(([k, v]) => k);
  }
}
