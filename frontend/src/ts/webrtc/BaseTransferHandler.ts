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
  RemovePeerConnectionMessage
} from '@/ts/types/messages/innerMessages';

export default abstract class BaseTransferHandler extends MessageHandler {

  protected connectionId: string | null = null;
  protected readonly wsHandler: WsHandler;
  protected readonly notifier: NotifierHandler;
  protected readonly logger: Logger;
  protected readonly store: DefaultStore;
  protected readonly roomId: number;
  protected webrtcConnnectionsIds: string[] = [];

  constructor(roomId: number, wsHandler: WsHandler, notifier: NotifierHandler, store: DefaultStore) {
    super();
    this.roomId = roomId;
    this.notifier = notifier;
    this.wsHandler = wsHandler;
    this.store = store;
    this.logger = loggerFactory.getLoggerColor('WRTC', '#960055');
    this.logger.log(`${this.constructor.name} has been created`)();
  }

  protected onDestroy() {
    if (this.connectionId) {
      sub.unsubscribe(Subscription.getTransferId(this.connectionId), this);
    }
  }

  public removePeerConnection(payload: RemovePeerConnectionMessage) {
    this.logger.log('Removing pc {}', payload);
    const start = this.webrtcConnnectionsIds.indexOf(payload.opponentWsId);
    if (start < 0) {
      throw Error('Can\'t remove unexisting payload ' + payload.opponentWsId);
    }
    this.webrtcConnnectionsIds.splice(start, 1);
    if (this.webrtcConnnectionsIds.length === 0) {
      this.onDestroy();
    }
  }

  protected closeAllPeerConnections() { // calls on destroy
    if (!this.connectionId) {
      this.logger.error(`Can't close connections since it's null`)();
      return;
    }
    this.webrtcConnnectionsIds.forEach(id => {
      let message: DestroyPeerConnectionMessage = {
        action: 'destroy',
        handler: Subscription.getPeerConnectionId(this.connectionId!, id),
        allowZeroSubscribers: true // TODO this is weird that this connection is desrtoyed already, should nto be destroyed twice
        // applying hotfix , this should be fixed in another way
        // Can't handle message  {action: "destroy", handler: "peerConnection:fzELFAhC:0001:AVmb"}  because no channels found, available channels
      };
      sub.notify(message);
    });
  }

}
