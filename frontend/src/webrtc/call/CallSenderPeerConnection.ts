import {ConnectToRemoteMessage, DefaultMessage} from '@/types/messages';
import WsHandler from '@/utils/WsHandler';
import CallPeerConnection from '@/webrtc/call/CallPeerConnection';
import {DefaultStore} from '@/utils/store';
import {HandlerType, HandlerTypes} from '@/types/types';

export default class CallSenderPeerConnection extends CallPeerConnection {

  protected connectedToRemote: boolean = false;

  protected readonly handlers: HandlerTypes = {
    destroy: this.onDestroy,
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

  public channelOpen () {
    this.logger.log('Opened a new chanel')();
  }

  public async connectToRemote(stream: ConnectToRemoteMessage) {
    this.logger.log('Connect to remote')();
    this.connectedToRemote = true;
    this.createPeerConnection(stream);
    await this.createOffer();
  }

  public ondatachannelclose(text: string): void {
  }

}
