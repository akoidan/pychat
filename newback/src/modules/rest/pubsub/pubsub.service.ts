import {WebsocketGateway} from '@/modules/api/websocket/websocket.gateway';
import {
  Injectable,
  Logger
} from '@nestjs/common';
import {WebSocketContextData} from '@/data/types/internal';


interface HandlerType {
  target: WebsocketGateway;
  memberName: keyof WebsocketGateway;
  handler: string;
}

let handlers: HandlerType[] = [];


// function stateDecoratorFactory<TPT extends VuexModule>(vuexModule: TPT):
// <TCT extends (TCT[TPN] extends TPT[TPN] ? unknown : never), TPN extends (keyof TCT & keyof TPT)>
// (vueComponent: TCT, fileName: TPN) => void {
//   return <TCT extends (TCT[TPN] extends TPT[TPN] ? unknown : never), TPN extends (keyof TCT & keyof TPT)>
//   (vueComponent: TCT, fileName: TPN):
//
export function Subscribe(handler: string) {
  return (target: WebsocketGateway, memberName: keyof WebsocketGateway, propertyDescriptor: PropertyDescriptor) => {
    handlers.push({
      handler,
      memberName,
      target,
    })
  }
}

let receivers: Record<string, {ctx: WebSocketContextData}[]> = {};

@Injectable()
export class PubsubService {

  constructor(
    private readonly logger: Logger,
  ) {
  }

  public emit(handler: string, data: any, ...channel: string[]) {
    channel.forEach(channel => {
      if (receivers[channel]) {
        receivers[channel].forEach(receiver => {
          let proxy = handlers.find(h => h.handler === handler);
          (proxy.target[proxy.memberName] as any)(receiver.ctx, data);
        })
      }
    })
  }

  public subscribe(context: WebSocketContextData, ...channel: string[]) {
    channel.forEach(channel => {
      if (!receivers[channel]) {
        receivers[channel] = []
      }
      receivers[channel].push({
        ctx: context
      })
    })

  }

  public unsubscribe(context: WebSocketContextData, ...channel: string[]) {
    channel.forEach(channel => {
      if (receivers[channel]) {
        let index = receivers[channel].findIndex(c => c.ctx = context);
        if (index >= 0) {
          receivers[channel].splice(index, 1);
        }
      }
    })
  }
}
