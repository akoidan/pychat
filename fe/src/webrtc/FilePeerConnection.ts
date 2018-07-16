import store from '../store';
import AbstractPeerConnection from './AbstractPeerConnection';
import {Logger} from 'lines-logger';
import {RootState} from '../types/model';
import {Store} from 'vuex';

export default class FilePeerConnection {
  private asp: AbstractPeerConnection;


  constructor(asp: AbstractPeerConnection) {
    this.asp = asp;
  }

  public oniceconnectionstatechange() {
    if (this.asp.pc.iceConnectionState === 'disconnected') {
      this.closeEvents('Connection has been lost');
    }
  }
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

  closeEvents (text?) {
    if (text) {
      this.asp.ondatachannelclose(text);
    }
    this.asp.logger.error('Closing event from {}', text)();
    this.asp.closePeerConnection();
    if (this.asp.sendChannel && this.asp.sendChannel.readyState !== 'closed') {
      this.asp.logger.log('Closing chanel')();
      this.asp.sendChannel.close();
    } else {
      this.asp.logger.log('No channels to close')();
    }
  }
}