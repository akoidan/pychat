import loggerFactory from "@/ts/instances/loggerFactory";
import type {Logger} from "lines-logger";
import type WsApi from "@/ts/message_handlers/WsApi";
import type NotifierHandler from "@/ts/classes/NotificationHandler";
import Subscription from "@/ts/classes/Subscription";

import type {DefaultStore} from "@/ts/classes/DefaultStore";

export default abstract class BaseTransferHandler {
  protected connectionId: string | null = null;

  protected readonly wsHandler: WsApi;

  protected readonly notifier: NotifierHandler;

  protected logger: Logger;

  protected readonly store: DefaultStore;

  protected readonly roomId: number;

  protected readonly sub: Subscription;

  public constructor(roomId: number, wsHandler: WsApi, notifier: NotifierHandler, store: DefaultStore, sub: Subscription) {
    this.roomId = roomId;
    this.notifier = notifier;
    this.wsHandler = wsHandler;
    this.store = store;
    this.sub = sub;
    this.logger = loggerFactory.getLoggerColor(`transfer:r${roomId}`, "#960055");
    this.logger.log(`${this.constructor.name} has been created`)();
  }

  public checkDestroy() {
    if (this.connectionId && this.sub.getNumberOfSubscribers(Subscription.allPeerConnectionsForTransfer(this.connectionId)) === 0) {
      this.onDestroy();
    }
  }

  protected setConnectionId(connId: string | null) {
    this.connectionId = connId;
    if (connId != null) {
      this.logger = loggerFactory.getLoggerColor(`transfer:${this.connectionId}`, "#960055");
    }
  }

  protected onDestroy() {
    if (this.connectionId) {
      this.sub.unsubscribe(Subscription.getTransferId(this.connectionId), this);
    }
  }
}
