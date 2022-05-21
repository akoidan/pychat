import type {DefaultWsInMessage, HandlerName} from "@common/ws/common";
import type {DefaultInnerSystemMessage} from "@/ts/types/messages/helper";

import loggerFactory from "@/ts/instances/loggerFactory";
import type {Logger} from "lines-logger";


export default class Subscription {
  // TODO sub should unsubscribe from some events on logout

  private suscribers: Partial<Record<HandlerName, any[]>> = {};

  private readonly logger: Logger;

  public constructor() {
    this.logger = loggerFactory.getLogger("sub");
  }

  public static getPeerConnectionId(connectionId: string, opponentWsId: string): "peerConnection:*" {
    return `peerConnection:${connectionId}:${opponentWsId}` as "peerConnection:*";
  }

  public static allPeerConnectionsForTransfer(connectionId: string): "peerConnection:*" {
    return `peerConnection:${connectionId}:ALL_OPPONENTS` as "peerConnection:*";
  }

  public static getTransferId(connectionId: string): "webrtcTransfer:*" {
    return `webrtcTransfer:${connectionId}` as "webrtcTransfer:*";
  }

  public getNumberOfSubscribers(channel: HandlerName): number {
    return this.suscribers[channel]?.length ?? 0;
  }

  public subscribe(channel: HandlerName, messageHandler: any) {
    if (!this.suscribers[channel]) {
      this.suscribers[channel] = [];
    }
    if (!this.suscribers[channel]!.includes(messageHandler)) {
      this.logger.log("subscribing to {}, handler {}", channel, messageHandler)();
      this.suscribers[channel]!.push(messageHandler);
    }
  }

  public unsubscribe(channel: HandlerName, handler: any) {
    const c = this.suscribers[channel];

    if (c) {
      const index = c.indexOf(handler);
      if (index >= 0) {
        this.logger.log("Unsubscribing from {} from handler {}", handler, channel)();
        c.splice(index, 1);
        if (c.length === 0) {
          delete this.suscribers[channel]; // Delete key
        }
        return;
      }
    }
    this.logger.error("Unable to find channel to delete {}", channel)();
  }

  public notify<T extends DefaultWsInMessage<string, HandlerName, any>>(message: T): boolean {
    this.logger.debug("notifing {}", message)();
    if (message.handler === "*") {
      Object.values(this.suscribers).forEach((channel) => {
        channel.forEach((h: any) => {
          if (h.getHandler(message)) {
            this.logger.debug(`Notifying (${message.handler}).[${message.action}] {}`, h)();
            h.handle(message);
          }
        });
      });
      return true;
    } else if (this.suscribers[message.handler]?.length) {
      this.suscribers[message.handler]!.forEach((h: any) => {
        this.logger.debug(`Notifying (${message.handler}).[${message.action}] {}`, h)();
        h.handle(message);
      });

      return true;
    }
    if (!(message as DefaultInnerSystemMessage<string, HandlerName, any>).allowZeroSubscribers) {
      this.logger.error("Can't handle message {} because no suscribers found, available suscribers {}", message, this.suscribers)();
    }

    return false;
  }
}
