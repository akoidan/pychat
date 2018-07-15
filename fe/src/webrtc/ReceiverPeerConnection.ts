import AbstractPeerConnection from './AbstractPeerConnection';
import {bytesToSize} from '../utils/utils';


export default abstract class ReceiverPeerConnection extends AbstractPeerConnection {
  protected onChannelMessage(event) {
    this.logger.log('Received {} from webrtc data channel', bytesToSize(event.data.byteLength))();
  }
}