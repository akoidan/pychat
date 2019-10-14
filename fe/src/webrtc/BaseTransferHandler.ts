import loggerFactory from '@/utils/loggerFactory';
import {Logger} from 'lines-logger';
import WsHandler from '@/utils/WsHandler';
import NotifierHandler from '@/utils/NotificationHandler';
import MessageHandler from '@/utils/MesageHandler';
import {sub} from '@/utils/sub';
import Subscription from '@/utils/Subscription';
import {RemovePeerConnection} from '@/types/types';
import {DefaultStore} from '@/utils/store';

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
    this.logger = loggerFactory.getLogger('WRTC', 'color: #960055');
  }

  protected onDestroy() {
    if (this.connectionId) {
      sub.unsubscribe(Subscription.getTransferId(this.connectionId));
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
