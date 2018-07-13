import loggerFactory from '../utils/loggerFactory';
import {Logger} from 'lines-logger';
import WsHandler from '../utils/WsHandler';
import NotifierHandler from '../utils/NotificationHandler';
import {RootState} from '../types/model';
import {Store} from 'vuex';

export default abstract class BaseTransferHandler {

  protected connectionId: string;
  protected wsHandler: WsHandler;
  protected notifier: NotifierHandler;
  protected logger: Logger;
  protected removeReferenceFn: Function;
  protected peerConnections: {} = {};
  protected store: Store<RootState>;

  constructor(removeReferenceFn: Function, wsHandler: WsHandler, notifier: NotifierHandler, store: Store<RootState>) {
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
    delete this.peerConnections[id];
  }

  handle(data) {
    if (data.handler === 'webrtcTransfer') {
      self['on' + data.action](data);
    } else if (this.peerConnections[data.opponentWsId]) {
      this.peerConnections[data.opponentWsId]['on' + data.action](data);
    } else { // this is only supposed to be for destroyPeerConnection
      // when this.pc.iceConnectionState === 'disconnected' fired before destroyCallConnection action came
      this.logger.error('Can\'t execute {} on {}, because such PC doesn\'t exist. Existing PC:{}',
          data.action, data.opponentWsId, Object.keys(this.peerConnections))();
    }
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