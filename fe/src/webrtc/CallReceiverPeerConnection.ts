import ReceiverPeerConnection from './ReceiverPeerConnection';
import {DefaultMessage} from '../types/messages';
import {RootState} from '../types/model';
import WsHandler from '../utils/WsHandler';
import {Store} from 'vuex';
import CallPeerConnection from './CallPeerConnection';

export default class CallReceiverPeerConnection extends ReceiverPeerConnection {

  protected connectedToRemote: boolean = false;
  private cpc: CallPeerConnection;

  constructor(roomId: number, connId: string, opponentWsId: string, wsHandler: WsHandler, store: Store<RootState>) {
    super(roomId, connId, opponentWsId, wsHandler, store);
    this.connectedToRemote = false;
    this.cpc = new CallPeerConnection(this);
    this.sdpConstraints = {
      'mandatory': {
        'OfferToReceiveAudio': true,
        'OfferToReceiveVideo': true
      }
    };
  }

  connectToRemote(stream) {
    this.connectedToRemote = true;
    this.createPeerConnection(stream);
  }

  createPeerConnection(stream: MediaStream) {
    super.createPeerConnection();
    this.cpc.createPeerConnection(stream);
  }

  protected readonly handlers: { [p: string]: SingleParamCB<DefaultMessage> } = {
    destroy: this.onDestroy,
  };

  ondatachannelclose(text): void {
  }

  oniceconnectionstatechange(): void {
  }
}
