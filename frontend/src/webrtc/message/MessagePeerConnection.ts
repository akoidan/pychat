import AbstractPeerConnection from '@/webrtc/AbstractPeerConnection';
import {DefaultMessage} from '@/types/messages';
import WsHandler from '@/utils/WsHandler';
import {DefaultStore} from '@/utils/store';

export default abstract class MessagePeerConnection extends AbstractPeerConnection {
  private opponentUserId: number;

  constructor(roomId: number, connId: string, opponentWsId: string, wsHandler: WsHandler, store: DefaultStore,userId: number) {
    super(roomId, connId, opponentWsId, wsHandler, store);
    this.opponentUserId = userId;
  }

  public oniceconnectionstatechange() {
    this.logger.log(`iceconnectionstate has been changed to ${this.pc!.iceConnectionState}`)
    if (this.pc!.iceConnectionState === 'disconnected' ||
        this.pc!.iceConnectionState === 'failed' ||
        this.pc!.iceConnectionState === 'closed') {
      this.closeEvents('Connection has been lost');
    }
  }

  public closeEvents (text?: string|DefaultMessage) {
    if (text) {
      this.ondatachannelclose(<string>text); // TODO
    }
    this.logger.error('Closing event from {}', text)();
    this.closePeerConnection();
    if (this.sendChannel && this.sendChannel.readyState !== 'closed') {
      this.logger.log('Closing chanel')();
      this.sendChannel.close();
    } else {
      this.logger.log('No channels to close')();
    }
  }

  private sendData(message: string): void {
    try {
      if (this.sendChannel!.readyState === 'open') {
        this.sendChannel!.send(message);
      } else {
        throw Error(`Can't write data into ${this.sendChannel!.readyState} channel`);
      }
    } catch (error) {
      // this.commitErrorIntoStore('Connection has been lost'); TODO
      this.closeEvents(String(error));
      this.logger.error('sendData {}', error)();
    }
  }
}
