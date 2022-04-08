import CallPeerConnection from "@/ts/webrtc/call/CallPeerConnection";
import type {ConnectToRemoteMessage} from "@/ts/types/messages/innerMessages";

export default class CallSenderPeerConnection extends CallPeerConnection {
  public async connectToRemote(stream: ConnectToRemoteMessage) {
    super.connectToRemote(stream);
    await this.createOffer();
  }
}
