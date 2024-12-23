import type {
  ConnectToRemoteMessage,
  ConnectToRemoteMessageBody
} from "@/ts/types/messages/inner/connect.to.remote";
import CallPeerConnection from "@/ts/webrtc/call/CallPeerConnection";


export default class CallSenderPeerConnection extends CallPeerConnection {
  public async connectToRemote(stream: ConnectToRemoteMessageBody) {
    super.connectToRemote(stream);
    await this.createOffer();
  }
}
