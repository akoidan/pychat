import SenderPeerConnection from './SenderPeerConnection';
import {AcceptFileMessage, DefaultMessage, DestroyFileConnectionMessage} from '../types/messages';
import {SetSendingFileStatus, SetSendingFileUploaded} from '../types/types';
import {FileTransferStatus, RootState} from '../types/model';
import WsHandler from '../utils/WsHandler';
import {Store} from 'vuex';
import {bytesToSize, getDay} from '../utils/utils';
import {READ_CHUNK_SIZE, SEND_CHUNK_SIZE} from '../utils/consts';
import FilePeerConnection from './FilePeerConnection';

export default class FileSenderPeerConnection extends SenderPeerConnection {

  private file: File;
  private reader: FileReader;
  private offset: number;
  private lastPrinted: number = 0;
  private lastMonitored: number = 0;
  private lastMonitoredValue: number = 0;

  protected readonly handlers: { [p: string]: SingleParamCB<DefaultMessage> } = {
    destroyFileConnection: this.destroyFileConnection,
    acceptFile: this.acceptFile,
  };
  private filePeerConnection: FilePeerConnection;

  constructor(roomId: number, connId: string, opponentWsId: string, removeChildPeerReference: (id) => void, wsHandler: WsHandler, store: Store<RootState>, file: File) {
    super(roomId, connId, opponentWsId, removeChildPeerReference, wsHandler, store);
    this.file = file;
    this.filePeerConnection = new FilePeerConnection(this);
  }

  oniceconnectionstatechange(): void {
    this.filePeerConnection.oniceconnectionstatechange();
  }

  acceptFile(message: AcceptFileMessage) {
    this.offset = message.content.received;
    this.createPeerConnection();
    let ssfs: SetSendingFileStatus = {
      status: FileTransferStatus.IN_PROGRESS,
      roomId: this.roomId,
      error: null,
      connId: this.connectionId,
      transfer: this.opponentWsId
    };
    this.store.commit('setSendingFileStatus', ssfs);
    let ssfu: SetSendingFileUploaded = {
      roomId: this.roomId,
      uploaded: message.content.received,
      connId: this.connectionId,
      transfer: this.opponentWsId
    };
    this.store.commit('setSendingFileUploaded', ssfu);
    try {
      // Reliable data channels not supported by Chrome
      this.sendChannel = this.pc.createDataChannel('sendDataChannel', {reliable: false});
      this.sendChannel.onopen = this.onreceiveChannelOpen;
      this.logger.log('Created send data channel.')();
    } catch (e) {
      let error = `Failed to create data channel because ${e.message || e}`;
      this.store.dispatch('growlError', error);
      this.logger.error('acceptFile {}', e)();
      return;
    }
    this.createOffer();
  }

  onreceiveChannelOpen() {
    this.logger.log('Channel is open, slicing file: {} {} {} {}', this.file.name, bytesToSize(this.file.size), this.file.type, getDay(this.file.lastModifiedDate))();
    if (this.file.size === 0) {
      let ssfs: SetSendingFileStatus = {
        status: FileTransferStatus.ERROR,
        roomId: this.roomId,
        error: `Can't send empty file`,
        connId: this.connectionId,
        transfer: this.opponentWsId
      };
      this.store.commit('setSendingFileStatus', ssfs);
      this.filePeerConnection.closeEvents(`Can't send empty file`);
    } else {
      this.reader = new FileReader();
      this.reader.onload = this.onFileReaderLoad.bind(this);
      this.sendCurrentSlice();
      this.lastPrinted = 0;
      this.lastMonitored = 0;
      this.lastMonitoredValue = 0;
    }
  }

  sendCurrentSlice() {
    let currentSlice = this.file.slice(this.offset, this.offset + READ_CHUNK_SIZE);
    this.reader.readAsArrayBuffer(currentSlice);
  }


  setTranseferdAmount(value: number) {
    let now = Date.now();
    let timeDiff = now - this.lastMonitored;
    if (timeDiff > 1000) {
      let ssfu: SetSendingFileUploaded = {
        roomId: this.roomId,
        uploaded: value,
        connId: this.connectionId,
        transfer: this.opponentWsId
      };
      this.store.commit('setSendingFileUploaded', ssfu);
      this.lastMonitoredValue = value;
      this.lastMonitored = now;
    }
  }
  

  sendData (data, offset, cb) {
    try {
      if (this.sendChannel.readyState === 'open') {
        if (this.sendChannel.bufferedAmount > 10000000) { // prevent chrome buffer overfill
          // if it happens chrome will just close the datachannel
          let now = Date.now();
          if (now - this.lastPrinted > 1000) {
            this.lastPrinted = now;
            this.logger.debug('Buffer overflow by {}bytes, waiting to flush...',
                bytesToSize(this.sendChannel.bufferedAmount))();
          }
          return setTimeout(this.sendData.bind(this), 100, data, offset, cb);
        } else {
          let buffer = data.slice(offset, offset + SEND_CHUNK_SIZE);
          this.sendChannel.send(buffer);
          let chunkOffset = offset + buffer.byteLength;
          this.setTranseferdAmount(this.offset + chunkOffset - this.sendChannel.bufferedAmount);
          if (data.byteLength > chunkOffset) {
            this.sendData(data, chunkOffset, cb);
          } else {
            cb();
          }
        }
      } else {
        throw `sendChannel status is ${this.sendChannel.readyState} which is not equals to "open"`;
      }
    } catch (error) {
      let ssfs: SetSendingFileStatus = {
        status: FileTransferStatus.ERROR,
        roomId: this.roomId,
        error: 'Error: Connection has been lost',
        connId: this.connectionId,
        transfer: this.opponentWsId
      };
      this.store.commit('setSendingFileStatus', ssfs);
      this.filePeerConnection.closeEvents(String(error));
      this.logger.error('sendData {}', error)();
    }
  }
  
  onFileReaderLoad(e) {
    if (e.target.result.byteLength > 0 ) {
      this.sendData(e.target.result, 0, () => {
        this.offset += e.target.result.byteLength;
        this.sendCurrentSlice();
      });
    } else {
      const trackTransfer = () => {
        if (this.sendChannel.readyState === 'open' && this.sendChannel.bufferedAmount > 0) {
          this.setTranseferdAmount(this.offset - this.sendChannel.bufferedAmount);
          setTimeout(trackTransfer, 500);
        } else if (this.sendChannel.bufferedAmount === 0) {
          this.setTranseferdAmount(this.offset);
        }
      };
      trackTransfer();
      this.logger.log('Exiting, offset is {} now, fs: {}', this.offset, this.file.size)();
    }
  }

  destroyFileConnection(message: DestroyFileConnectionMessage) {
    let isDecline = message.content === 'decline';
    let payload: SetSendingFileStatus = {
      transfer: this.opponentWsId,
      connId: this.connectionId,
      error: isDecline ? null : message.content,
      roomId: this.roomId,
      status: isDecline ? FileTransferStatus.DECLINED : FileTransferStatus.ERROR
    };
    this.store.commit('setSendingFileStatus', payload);
  }
}