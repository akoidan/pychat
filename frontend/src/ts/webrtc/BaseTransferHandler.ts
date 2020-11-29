import loggerFactory from '@/ts/instances/loggerFactory';
import { Logger } from 'lines-logger';
import WsHandler from '@/ts/message_handlers/WsHandler';
import NotifierHandler from '@/ts/classes/NotificationHandler';
import MessageHandler from '@/ts/message_handlers/MesageHandler';
import { sub } from '@/ts/instances/subInstance';
import Subscription from '@/ts/classes/Subscription';

import { DefaultStore } from '@/ts/classes/DefaultStore';
import {
  DestroyPeerConnectionMessage,
  InternetAppearMessage,
  CheckTransferDestroy
} from '@/ts/types/messages/innerMessages';

export default abstract class BaseTransferHandler extends MessageHandler {

  protected connectionId: string | null = null;
  protected readonly wsHandler: WsHandler;
  protected readonly notifier: NotifierHandler;
  protected logger: Logger;
  protected readonly store: DefaultStore;
  protected readonly roomId: number;

  constructor(roomId: number, wsHandler: WsHandler, notifier: NotifierHandler, store: DefaultStore) {
    super();
    this.roomId = roomId;
    this.notifier = notifier;
    this.wsHandler = wsHandler;
    this.store = store;
    this.logger = loggerFactory.getLoggerColor(`transfer:r${roomId}`, '#960055');
    this.logger.log(`${this.constructor.name} has been created`)();
  }

  public checkDestroy() {
    if (this.connectionId && sub.getNumberOfSubscribers(Subscription.allPeerConnectionsForTransfer(this.connectionId)) === 0) {
      this.onDestroy();
    }
  }

  protected setConnectionId(connId: string|null) {
    this.connectionId = connId;
    if (connId != null) {
      this.logger = loggerFactory.getLoggerColor(`transfer:${this.connectionId}`, '#960055');
    }
  }

  protected onDestroy() {
    if (this.connectionId) {
      sub.unsubscribe(Subscription.getTransferId(this.connectionId), this);
    }
  }

}
