import {DefaultMessage} from '../types/messages';
import {RootState} from '../types/model';
import WsHandler from '../utils/WsHandler';
import {Store} from 'vuex';
import CallPeerConnection from './CallPeerConnection';

export default class CallReceiverPeerConnection extends CallPeerConnection {

  protected connectedToRemote: boolean = false;

  protected readonly handlers: { [p: string]: SingleParamCB<DefaultMessage> } = {
    destroy: this.onDestroy,
    streamChanged: this.onStreamChanged,
    connectToRemote: this.connectToRemote,
    sendRtcData: this.onsendRtcData,
  };

  constructor(roomId: number, connId: string, opponentWsId: string, userId: number, wsHandler: WsHandler, store: Store<RootState>) {
    super(roomId, connId, opponentWsId, userId, wsHandler, store);
    this.connectedToRemote = false;
    this.sdpConstraints = {
      'mandatory': {
        'OfferToReceiveAudio': true,
        'OfferToReceiveVideo': true
      }
    };
  }

  connectToRemote(stream) {
    this.logger.log('Connect to remote')();
    this.connectedToRemote = true;
    this.createPeerConnection(stream);
  }

  ondatachannelclose(text): void {
  }

}
