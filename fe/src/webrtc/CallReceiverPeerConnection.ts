import {DefaultMessage} from '@/types/messages';
import WsHandler from '@/utils/WsHandler';
import CallPeerConnection from '@/webrtc/CallPeerConnection';
import {DefaultStore} from'@/utils/store';

export default class CallReceiverPeerConnection extends CallPeerConnection {

  protected connectedToRemote: boolean = false;

  protected readonly handlers: { [p: string]: SingleParamCB<DefaultMessage> } = {
    destroy: this.onDestroy,
    streamChanged: this.onStreamChanged,
    connectToRemote: this.connectToRemote,
    sendRtcData: this.onsendRtcData,
  };

  constructor(roomId: number, connId: string, opponentWsId: string, userId: number, wsHandler: WsHandler, store: DefaultStore) {
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
