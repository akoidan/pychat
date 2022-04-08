import MessagePeerConnection from "@/ts/webrtc/message/MessagePeerConnection";

export default class MessageSenderPeerConnection extends MessagePeerConnection {
  public makeConnection() {
    if (this.status !== "not_inited") {
      return;
    }
    this.status = "inited";
    this.createPeerConnection();
    // This.store.setSendingFileStatus(ssfs);
    try {
      // Reliable data channels not supported by Chrome
      this.sendChannel = this.pc!.createDataChannel("sendDataChannel", {reliable: false});
      this.setupEvents();
      this.logger.log("Created send data channel.")();
    } catch (e: any) {
      const error = `Failed to create data channel because ${e.message || e}`;
      this.logger.error("acceptFile {}", e)();

      return;
    }
    this.createOffer();
  }
}
