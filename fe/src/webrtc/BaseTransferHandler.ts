import loggerFactory from '../utils/loggerFactory';
import {Logger} from 'lines-logger';
import WsHandler from '../utils/WsHandler';
import NotifierHandler from '../utils/NotificationHandler';
import {RootState} from '../types/model';
import {Store} from 'vuex';
import MessageHandler from '../utils/MesageHandler';
import {sub} from '../utils/sub';
import Subscription from '../utils/Subscription';
import {RemovePeerConnection} from '../types/types';

export default abstract class BaseTransferHandler extends MessageHandler {

  protected connectionId: string;
  protected readonly wsHandler: WsHandler;
  protected readonly notifier: NotifierHandler;
  protected readonly logger: Logger;
  protected readonly store: Store<RootState>;
  protected readonly roomId: number;
  protected webrtcConnnectionsIds: string[] = [];

  constructor(roomId: number, wsHandler: WsHandler, notifier: NotifierHandler, store: Store<RootState>) {
    super();
    this.roomId = roomId;
    this.notifier = notifier;
    this.wsHandler = wsHandler;
    this.store = store;
    this.logger = loggerFactory.getLogger('WRTC', 'color: #960055');
  }

  protected  onDestroy() {
     sub.unsubscribe(Subscription.getTransferId(this.connectionId));
  }

  protected removePeerConnection(payload: RemovePeerConnection) {
    this.webrtcConnnectionsIds.splice(this.webrtcConnnectionsIds.indexOf(payload.opponentWsId), 1);
    if (this.webrtcConnnectionsIds.length === 0) {
      this.onDestroy();
    }
  }

  protected closeAllPeerConnections() {
    this.webrtcConnnectionsIds.forEach(id => {
      sub.notify({
        action: 'destroy',
        handler: Subscription.getPeerConnectionId(this.connectionId, id)
      });
    });
  }

}