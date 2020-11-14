import AbstractPeerConnection from '@/webrtc/AbstractPeerConnection';
import { DefaultMessage } from '@/types/messages';

export default abstract class FilePeerConnection extends AbstractPeerConnection {

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
}
