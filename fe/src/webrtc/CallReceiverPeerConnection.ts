import {DefaultMessage} from '../types/messages';
import {RootState} from '../types/model';
import WsHandler from '../utils/WsHandler';
import {Store} from 'vuex';
import CallPeerConnection from './CallPeerConnection';

export default class CallReceiverPeerConnection extends CallPeerConnection {

  protected connectedToRemote: boolean = false;

  constructor(roomId: number, connId: string, opponentWsId: string, wsHandler: WsHandler, store: Store<RootState>) {
    super(roomId, connId, opponentWsId, wsHandler, store);
    this.connectedToRemote = false;
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

  protected readonly handlers: { [p: string]: SingleParamCB<DefaultMessage> } = {
    destroy: this.onDestroy,
    streamChanged: this.onStreamChanged,
  };

  ondatachannelclose(text): void {
  }

}
