import {DefaultMessage} from '../types/messages';
import {RootState} from '../types/model';
import WsHandler from '../utils/WsHandler';
import {Store} from 'vuex';
import CallPeerConnection from './CallPeerConnection';

export default class CallSenderPeerConnection extends CallPeerConnection {

  protected connectedToRemote: boolean = false;
  private cpc: CallPeerConnection;

  protected readonly handlers: { [p: string]: SingleParamCB<DefaultMessage> } = {
    destroy: this.onDestroy,
    streamChanged: this.onStreamChanged,
  };

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

  channelOpen = function () {
    this.logger.log('Opened a new chanel')();
  };

  connectToRemote(stream) {
    this.connectedToRemote = true;
    this.createOffer();
    this.createPeerConnection(stream);
  }

  createPeerConnection(stream: MediaStream) {
    super.createPeerConnection(stream);
    this.cpc.createPeerConnection(stream);
  }



  ondatachannelclose(text): void {
  }

}
