import ReceiverPeerConnection from './ReceiverPeerConnection';
import {DefaultMessage} from '../types/messages';
import {RootState} from '../types/model';
import WsHandler from '../utils/WsHandler';
import {Store} from 'vuex';
import SenderPeerConnection from './SenderPeerConnection';

export default class CallSenderPeerConnection extends SenderPeerConnection {

  protected connectedToRemote: boolean = false;

  constructor(roomId: number, connId: string, opponentWsId: string, wsHandler: WsHandler, store: Store<RootState>) {
    super(roomId, connId, opponentWsId, wsHandler, store);
    this.connectedToRemote = false;
  }

  connectToRemote(stream) {
    this.connectedToRemote = true;
    this.createPeerConnection(stream);
  }

  createPeerConnection(stream: MediaStream) {

  }

  protected readonly handlers: { [p: string]: SingleParamCB<DefaultMessage> };

  ondatachannelclose(text): void {
  }

  oniceconnectionstatechange(): void {
  }
}
