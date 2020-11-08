import {HandlerType, HandlerTypes} from '@/utils/MesageHandler';
import MessagePeerConnection from '@/webrtc/message/MessagePeerConnection';


// CALL this.waitForAnswer()
export default class MessageReceiverPeerConnection extends MessagePeerConnection {
  protected connectedToRemote: boolean = true;

  protected readonly handlers: HandlerTypes = {
    sendRtcData: <HandlerType>this.onsendRtcData,
  };


  public ondatachannelclose(text: string): void {
   debugger
  }

  protected onChannelMessage(event: MessageEvent) {

    // TODO
    debugger
  }


  private gotReceiveChannel(event: RTCDataChannelEvent) {
    this.logger.debug('Received new channel')();
    this.sendChannel = event.channel;
    this.sendChannel.onmessage = this.onChannelMessage.bind(this);
    this.sendChannel.onopen = () => {
      this.logger.debug('Channel opened')();
    };
    this.sendChannel.onclose = () => this.logger.log('Closed channel ')();
  }

  public waitForAnswer() {
    this.createPeerConnection();
    this.pc!.ondatachannel = this.gotReceiveChannel.bind(this);
  }

}
