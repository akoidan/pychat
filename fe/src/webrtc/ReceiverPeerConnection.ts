import AbstractPeerConnection from './AbstractPeerConnection';
import {bytesToSize} from '../utils/utils';


export default abstract class ReceiverPeerConnection extends AbstractPeerConnection {
  onChannelMessage(msg) {
    // this.logger.log('Received {} from webrtc data channel', bytesToSize(event.data.byteLength))();
  }
}