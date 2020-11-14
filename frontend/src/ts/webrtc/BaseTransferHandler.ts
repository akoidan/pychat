import loggerFactory from '@/ts/instances/loggerFactory';
import { Logger } from 'lines-logger';
import WsHandler from '@/ts/message_handlers/WsHandler';
import NotifierHandler from '@/ts/classes/NotificationHandler';
import MessageHandler from '@/ts/message_handlers/MesageHandler';
import { sub } from '@/ts/instances/subInstance';
import Subscription from '@/ts/classes/Subscription';
import { RemovePeerConnection } from '@/ts/types/types';
import { DefaultStore } from '@/ts/classes/DefaultStore';

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
  }

  protected onDestroy() {
    if (this.connectionId) {
      sub.unsubscribe(Subscription.getTransferId(this.connectionId), this);
    }
  }

  protected removePeerConnection(payload: RemovePeerConnection) {
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
      sub.notify({
        action: 'destroy',
        handler: Subscription.getPeerConnectionId(this.connectionId!, id)
      });
    });
  }

}
