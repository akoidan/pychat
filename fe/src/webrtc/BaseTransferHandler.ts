import loggerFactory from '../utils/loggerFactory';
import {Logger} from 'lines-logger';
import WsHandler from '../utils/WsHandler';
import NotifierHandler from '../utils/NotificationHandler';
import {RootState} from '../types/model';
import {Store} from 'vuex';
import MessageHandler from '../utils/MesageHandler';
import {sub} from '../utils/sub';
import Subscription from '../utils/Subscription';

export default abstract class BaseTransferHandler extends MessageHandler {

  protected readonly connectionId: string;
  protected readonly wsHandler: WsHandler;
  protected readonly notifier: NotifierHandler;
  protected readonly logger: Logger;
  protected readonly store: Store<RootState>;
  protected readonly roomId: number;

  constructor(roomId: number, connId: string, wsHandler: WsHandler, notifier: NotifierHandler, store: Store<RootState>) {
    super();
    this.roomId = roomId;
    this.connectionId = connId;
    sub.subscribe(Subscription.getTransferId(connId), this);
    this.notifier = notifier;
    this.wsHandler = wsHandler;
    this.store = store;
    this.logger = loggerFactory.getLogger('WRTC', 'color: #960055');
  }

   onDestroy() {
     sub.unsubscribe(Subscription.getTransferId(this.connectionId));
  }
}