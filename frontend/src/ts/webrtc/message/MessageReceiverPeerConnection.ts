import MessagePeerConnection from '@/ts/webrtc/message/MessagePeerConnection';


// CALL this.waitForAnswer()
export default class MessageReceiverPeerConnection extends MessagePeerConnection {
  protected connectedToRemote: boolean = true;

  public ondatachannelclose(text: string): void {
   // TODO
  }

  public makeConnection() {
    if (this.status !== 'not_inited') {
      return
    }
    this.status = 'inited';
    this.createPeerConnection();
    this.pc!.ondatachannel = this.gotReceiveChannel.bind(this);
  }

  private gotReceiveChannel(event: RTCDataChannelEvent) {
    this.logger.debug('Received new channel')();
    this.sendChannel = event.channel;
    this.setupEvents();
  }

}
