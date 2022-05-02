import {DefaultInnerSystemMessage} from "@/ts/types/messages/helper";
import {ChangeP2pRoomInfoMessage} from "@/ts/types/messages/inner/change.p2p.room.info";
import {ChangeStreamMessage} from "@/ts/types/messages/inner/change.stream";
import {ChangeUserOnlineInfoMessage} from "@/ts/types/messages/inner/change.user.online.info";
import {CheckTransferDestroyMessage} from "@/ts/types/messages/inner/check.transfer.destroy";
import {ConnectToRemoteMessage} from "@/ts/types/messages/inner/connect.to.remote";
import {DestroyPeerConnectionMessage} from "@/ts/types/messages/inner/destroy.peer.connection";
import {InternetAppearMessage} from "@/ts/types/messages/inner/internet.appear";
import {LoginMessage} from "@/ts/types/messages/inner/login";
import {LogoutMessage} from "@/ts/types/messages/inner/logout";
import {PubSetRoomsMessage} from "@/ts/types/messages/inner/pub.set.rooms";
import {RouterNavigateMessage} from "@/ts/types/messages/inner/router.navigate";
import {SendSetMessagesStatusMessage} from "@/ts/types/messages/inner/send.set.messages.status";
import {SyncP2PMessage} from "@/ts/types/messages/inner/sync.p2p";
import {IMessageHandler} from "@common/legacy";
import loggerFactory from "@/ts/instances/loggerFactory";
import type {Logger} from "lines-logger";


export default class Subscription {
  // TODO sub should unsubscribe from some events on logout

  private suscribers: Partial<Record<HandlerName, IMessageHandler[]>> = {};

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

  public subscribe(channel: HandlerName, messageHandler: IMessageHandler) {
    if (!this.suscribers[channel]) {
      this.suscribers[channel] = [];
    }
    if (!this.suscribers[channel]!.includes(messageHandler)) {
      this.logger.log("subscribing to {}, handler {}", channel, messageHandler)();
      this.suscribers[channel]!.push(messageHandler);
    }
  }

  public unsubscribe(channel: HandlerName, handler: IMessageHandler) {
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

  public notify<T extends DefaultInMessage<string, HandlerName>>(message: T): boolean {
    this.logger.debug("notifing {}", message)();
    if (message.handler === "*") {
      Object.values(this.suscribers).forEach((channel) => {
        channel.forEach((h: IMessageHandler) => {
          if (h.getHandler(message)) {
            this.logger.debug(`Notifying (${message.handler}).[${message.action}] {}`, h)();
            h.handle(message);
          }
        });
      });
      return true;
    } else if (this.suscribers[message.handler]?.length) {
      this.suscribers[message.handler]!.forEach((h: IMessageHandler) => {
        this.logger.debug(`Notifying (${message.handler}).[${message.action}] {}`, h)();
        h.handle(message);
      });

      return true;
    }
    if (!(message as DefaultInnerSystemMessage<string, HandlerName>).allowZeroSubscribers) {
      this.logger.error("Can't handle message {} because no suscribers found, available suscribers {}", message, this.suscribers)();
    }

    return false;
  }
}
