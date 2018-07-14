import store from '../store';
import AbstractPeerConnection from './AbstractPeerConnection';

const SEND_CHUNK_SIZE = 16384;
const READ_CHUNK_SIZE = SEND_CHUNK_SIZE * 64;
const MAX_BUFFER_SIZE = 256;


export default abstract class FilePeerConnection extends AbstractPeerConnection {
  // oniceconnectionstatechange() {
  //   if (this.pc.iceConnectionState === 'disconnected') {
  //     this.closeEvents();
  //     store.dispatch('growlError', 'Error: Connection has been lost');
  //   }
  // }
  //
  //
  // ondestroyFileConnection() {
  //   this.removeChildPeerReference(this.opponentWsId);
  //   this.closeEvents();
  // }
  //

  // setTranseferdAmount (value) {
  //   let now = Date.now();
  //   let timeDiff = now - this.lastMonitored;
  //   if (timeDiff > 1000) {
  //     let speed = (value - this.lastMonitoredValue) / timeDiff * 1000
  //     this.lastMonitoredValue = value;
  //     this.lastMonitored = now;
  //     this.downloadBar.setStatus('{}/{} ({}/s)'.format(
  //         bytesToSize(value),
  //         bytesToSize(this.fileSize),
  //         bytesToSize(speed)
  //     ));
  //   }
  //
  //   this.downloadBar.setValue(value);
  // }
  //
  // closeEvents () {
  //   this.closePeerConnection();
  //   if (this.sendChannel && this.sendChannel.readyState !== 'closed') {
  //     logger.log("Closing chanel")();
  //     this.sendChannel.close();
  //   } else {
  //     logger.log("No channels to close")();
  //   }
  // }
}