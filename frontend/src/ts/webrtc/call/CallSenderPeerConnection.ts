import {ConnectToRemoteMessage} from "@/ts/types/messages/inner/connect.to.remote";
import CallPeerConnection from "@/ts/webrtc/call/CallPeerConnection";


export default class CallSenderPeerConnection extends CallPeerConnection {
  public async connectToRemote(stream: ConnectToRemoteMessage) {
    super.connectToRemote(stream);
    await this.createOffer();
  }
}
