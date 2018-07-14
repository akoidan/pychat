import loggerFactory from '../utils/loggerFactory';
import {Logger} from 'lines-logger';
import WsHandler from '../utils/WsHandler';
import NotifierHandler from '../utils/NotificationHandler';
import {RootState} from '../types/model';
import {Store} from 'vuex';
import MessageHandler from '../utils/MesageHandler';
import {sub} from '../utils/sub';

export default abstract class BaseTransferHandler extends MessageHandler {

  protected connectionId: string;
  protected wsHandler: WsHandler;
  protected notifier: NotifierHandler;
  protected logger: Logger;
  protected removeReferenceFn: Function;
  protected peerConnections: {} = {};
  protected store: Store<RootState>;

  constructor(connId: string, removeReferenceFn: Function, wsHandler: WsHandler, notifier: NotifierHandler, store: Store<RootState>) {
    super();
    sub.subscribe('webrtcTransfer:' + connId, this)
    this.removeReferenceFn = removeReferenceFn;
    this.notifier = notifier;
    this.wsHandler = wsHandler;
    this.store = store;
    this.logger = loggerFactory.getLogger('WRTC', 'color: #960055');
  }

  removeReference() {
    this.removeReferenceFn(this.connectionId);
  }

  removeChildPeerReference (id) {
    this.logger.log('Removing peer connection {}', id)();
    sub.unsubscribe('peerConnection:' + id);
    delete this.peerConnections[id];
  }

  setConnectionId(id) {
    this.connectionId = id;
    this.logger = loggerFactory.getLogger(this.connectionId, 'color: #960055');
    this.logger.log('CallHandler initialized')();
  }

  closeAllPeerConnections(text) {
    let hasConnections = false;
    for (let pc in this.peerConnections) {
      if (!this.peerConnections.hasOwnProperty(pc)) continue;
      this.peerConnections[pc].closeEvents(text);
      hasConnections = true;
    }
    return hasConnections;
  }

}