import AbstractPeerConnection from '@/ts/webrtc/AbstractPeerConnection';
import { DefaultWsInMessage } from '@/ts/types/messages/wsInMessages';
import { HandlerName } from '@/ts/types/messages/baseMessagesInterfaces';
import { DestroyPeerConnectionMessage } from "@/ts/types/messages/innerMessages";

export default abstract class FilePeerConnection extends AbstractPeerConnection {

  public connectedToRemote: boolean = true;

  public oniceconnectionstatechange() {
    this.logger.log(`iceconnectionstate has been changed to ${this.pc!.iceConnectionState}`)
    if (this.pc!.iceConnectionState === 'disconnected' ||
        this.pc!.iceConnectionState === 'failed' ||
        this.pc!.iceConnectionState === 'closed') {
      this.closeEvents('Connection has been lost');
    }
  }

  public destroy(message: DestroyPeerConnectionMessage) {
    this.closeEvents()
  }

  public closeEvents (text?: string) {
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
