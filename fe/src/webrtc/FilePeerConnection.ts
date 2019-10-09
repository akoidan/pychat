import AbstractPeerConnection from '@/webrtc/AbstractPeerConnection';

export default abstract class FilePeerConnection extends AbstractPeerConnection {

  public oniceconnectionstatechange() {
    if (this.pc.iceConnectionState === 'disconnected') {
      this.closeEvents('Connection has been lost');
    }
  }

  closeEvents (text?: string) {
    if (text) {
      this.ondatachannelclose(text);
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
