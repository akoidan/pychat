import AbstractPeerConnection from "@/ts/webrtc/AbstractPeerConnection";

export default abstract class FilePeerConnection extends AbstractPeerConnection {
  public connectedToRemote: boolean = true;

  public oniceconnectionstatechange() {
    this.logger.log(`iceconnectionstate has been changed to ${this.pc!.iceConnectionState}`);
    if (this.pc!.iceConnectionState === "disconnected" ||
      this.pc!.iceConnectionState === "failed" ||
      this.pc!.iceConnectionState === "closed") {
      this.commitErrorIntoStore("Connection has been lost", true);
      // Do not destroy peer connection here, opponent may want to retry
    }
  }

  public abstract commitErrorIntoStore(error: string, onlyIfNotFinished: boolean): void;
}
