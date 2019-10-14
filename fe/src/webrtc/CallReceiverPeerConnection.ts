import {ConnectToRemoteMessage, DefaultMessage} from '@/types/messages';
import WsHandler from '@/utils/WsHandler';
import CallPeerConnection from '@/webrtc/CallPeerConnection';
import {DefaultStore} from'@/utils/store';
import {HandlerType, HandlerTypes} from '@/utils/MesageHandler';

export default class CallReceiverPeerConnection extends CallPeerConnection {

  protected connectedToRemote: boolean = false;

  protected readonly handlers: HandlerTypes = {
    destroy: <HandlerType>this.onDestroy,
    streamChanged: <HandlerType>this.onStreamChanged,
    connectToRemote: <HandlerType>this.connectToRemote,
    sendRtcData: <HandlerType>this.onsendRtcData
  };

  constructor(roomId: number, connId: string, opponentWsId: string, userId: number, wsHandler: WsHandler, store: DefaultStore) {
    super(roomId, connId, opponentWsId, userId, wsHandler, store);
    this.connectedToRemote = false;
    this.sdpConstraints = {
      mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
      }
    };
  }

  public connectToRemote(stream: ConnectToRemoteMessage) {
    this.logger.log('Connect to remote')();
    this.connectedToRemote = true;
    this.createPeerConnection(stream);
  }

  public ondatachannelclose(text: string): void {
  }

}
