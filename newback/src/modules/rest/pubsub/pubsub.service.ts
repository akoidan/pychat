import type {WebsocketGateway} from "@/modules/api/websocket/websocket.gateway";
import {
  Injectable,
  Logger,
} from "@nestjs/common";
import type {WebSocketContextData} from "@/data/types/internal";
import type {PubSubMessage} from "@/modules/api/websocket/interfaces/pubsub";
import type {HandlerName} from "@/data/types/frontend";
import {DefaultWsInMessage} from "@/data/types/frontend";


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

  public emit<PS extends PubSubMessage<A, H>, A extends string, H extends HandlerName>(handler: keyof WebsocketGateway, data: PS, ...channel: string[]) {
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

  public unsubscribe(context: WebSocketContextData, ...channel: string[]) {
    channel.forEach((channel) => {
      if (receivers[channel]) {
        const index = receivers[channel].findIndex((c) => c.ctx = context);
        if (index >= 0) {
          receivers[channel].splice(index, 1);
        }
      }
    });
  }
}
