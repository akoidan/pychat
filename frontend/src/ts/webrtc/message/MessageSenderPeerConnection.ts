import MessagePeerConnection from '@/ts/webrtc/message/MessagePeerConnection';

export default class MessageSenderPeerConnection extends MessagePeerConnection {

  public makeConnection() {
    if (this.status !== 'not_inited') {
      return;
    }
    this.status = 'inited';
    this.createPeerConnection();
    //this.store.setSendingFileStatus(ssfs);
    try {
      // Reliable data channels not supported by Chrome
      this.sendChannel = this.pc!.createDataChannel('sendDataChannel', {reliable: false});
      this.setupEvents();
      this.logger.log('Created send data channel.')();
    } catch (e) {
      const error = `Failed to create data channel because ${e.message || e}`;
      this.commitErrorIntoStore(error);
      this.logger.error('acceptFile {}', e)();

      return;
    }
    this.createOffer();
  }

  public ondatachannelclose(error: string): void {

    // TODO
    // // channel could be closed in success and in error, we don't know why it was closed
    // if (this.store.roomsDict[this.roomId].sendingFiles[this.connectionId].transfers[this.opponentWsId].status !== FileTransferStatus.FINISHED) {
    //   this.commitErrorIntoStore(error);
    // }
  }

  private commitErrorIntoStore(error: string) {
    //TODO
    // const ssfs: SetSendingFileStatus = {
    //   status: FileTransferStatus.ERROR,
    //   roomId: this.roomId,
    //   error,
    //   connId: this.connectionId,
    //   transfer: this.opponentWsId
    // };
    // this.store.setSendingFileStatus(ssfs);
  }
}
