import {
  AcceptFileMessage,
  DefaultMessage,
  DestroyFileConnectionMessage
} from '@/types/messages';
import {
  AddSendingFileTransfer,
  SetSendingFileStatus,
  SetSendingFileUploaded
} from '@/types/types';
import {FileTransferStatus} from '@/types/model';
import WsHandler from '@/utils/WsHandler';
import {bytesToSize, getDay} from '@/utils/utils';
import {READ_CHUNK_SIZE, SEND_CHUNK_SIZE} from '@/utils/consts';
import FilePeerConnection from '@/webrtc/FilePeerConnection';
import {DefaultStore} from'@/utils/store';
import {HandlerType, HandlerTypes} from '@/utils/MesageHandler';

export default class FileSenderPeerConnection extends FilePeerConnection {

  private file: File;
  private reader: FileReader | null = null;
  private offset: number = 0;
  private lastPrinted: number = 0;
  protected connectedToRemote: boolean = true;

  protected readonly handlers: HandlerTypes = {
    destroyFileConnection: <HandlerType>this.destroyFileConnection,
    acceptFile: <HandlerType>this.acceptFile,
    sendRtcData: <HandlerType>this.onsendRtcData,
    destroy: <HandlerType>this.closeEvents,
    declineSending: <HandlerType>this.declineSending,
  };

  constructor(roomId: number, connId: string, opponentWsId: string, wsHandler: WsHandler, store: DefaultStore, file: File, userId: number) {
    super(roomId, connId, opponentWsId, wsHandler, store);
    this.file = file;
    let asft:  AddSendingFileTransfer = {
      connId,
      transferId: opponentWsId,
      roomId,
      transfer: {
        status: FileTransferStatus.NOT_DECIDED_YET,
        error: null,
        userId: userId,
        upload: {
          total: this.file.size,
          uploaded: 0,
        }
      }
    };
    this.store.addSendingFileTransfer(asft);
  }

  private declineSending() {
    this.onDestroy();
    let ssfs: SetSendingFileStatus = {
      status: FileTransferStatus.DECLINED_BY_YOU,
      roomId: this.roomId,
      error: null,
      connId: this.connectionId,
      transfer: this.opponentWsId
    };
    this.store.setSendingFileStatus(ssfs);
    this.wsHandler.destroyPeerFileConnection(this.connectionId, 'decline', this.opponentWsId);
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
    this.store.setSendingFileStatus(ssfs);
    this.setTranseferdAmount(message.content.received);
    try {
      // Reliable data channels not supported by Chrome
      this.sendChannel = this.pc!.createDataChannel('sendDataChannel', {reliable: false});
      this.sendChannel.onopen = this.onreceiveChannelOpen.bind(this);
      this.logger.log('Created send data channel.')();
    } catch (e) {
      let error = `Failed to create data channel because ${e.message || e}`;
      this.commitErrorIntoStore(error);
      this.logger.error('acceptFile {}', e)();
      return;
    }
    this.createOffer();
    this.wsHandler.retry(this.connectionId, this.opponentWsId);
  }

  onreceiveChannelOpen() {
    this.logger.log('Channel is open, slicing file: {} {} {} {}', this.file.name, bytesToSize(this.file.size), this.file.type, getDay(new Date(this.file.lastModified)))();
    this.reader = new FileReader();
    this.reader.onload = this.onFileReaderLoad.bind(this);
    this.sendCurrentSlice();
    this.lastPrinted = 0;
  }

  sendCurrentSlice() {
    let currentSlice = this.file.slice(this.offset, this.offset + READ_CHUNK_SIZE);
    this.reader!.readAsArrayBuffer(currentSlice);
  }


  setTranseferdAmount(value: number) {
    let ssfu: SetSendingFileUploaded = {
      roomId: this.roomId,
      uploaded: value,
      connId: this.connectionId,
      transfer: this.opponentWsId
    };
    this.store.setSendingFileUploaded(ssfu);
  }
  

  private sendData(data: ArrayBuffer, offset: number, cb: () => void): void {
    try {
      if (this.sendChannel!.readyState === 'open') {
        if (this.sendChannel!.bufferedAmount > 10000000) { // prevent chrome buffer overfill
          // if it happens chrome will just close the datachannel
          let now = Date.now();
          if (now - this.lastPrinted > 1000) {
            this.lastPrinted = now;
            this.logger.debug('Buffer overflow by {}bytes, waiting to flush...',
                bytesToSize(this.sendChannel!.bufferedAmount))();
          }
          setTimeout(this.sendData.bind(this), 100, data, offset, cb);
          return;
        } else {
          let buffer = data.slice(offset, offset + SEND_CHUNK_SIZE);
          this.sendChannel!.send(buffer);
          let chunkOffset = offset + buffer.byteLength;
          this.setTranseferdAmount(this.offset + chunkOffset - this.sendChannel!.bufferedAmount);
          if (data.byteLength > chunkOffset) {
            this.sendData(data, chunkOffset, cb);
          } else {
            cb();
          }
        }
      } else {
        throw Error(`Can't write data into ${this.sendChannel!.readyState} channel`);
      }
    } catch (error) {
      this.commitErrorIntoStore('Connection has been lost');
      this.closeEvents(String(error));
      this.logger.error('sendData {}', error)();
    }
  }
  
  onFileReaderLoad(e: ProgressEvent<FileReader>) {
    if ((<ArrayBuffer>e.target!.result).byteLength > 0 ) { // TODO if it's an str?
      this.sendData(<ArrayBuffer>e.target!.result, 0, () => {
        this.offset += (<ArrayBuffer>e.target!.result).byteLength;
        this.sendCurrentSlice();
      });
    } else {
      const trackTransfer = () => {
        if (this.sendChannel!.readyState === 'open' && this.sendChannel!.bufferedAmount > 0) {
          this.setTranseferdAmount(this.offset - this.sendChannel!.bufferedAmount);
          setTimeout(trackTransfer, 500);
        } else if (this.sendChannel!.bufferedAmount === 0) {
          this.setTranseferdAmount(this.offset);
        }
      };
      trackTransfer();
      this.logger.log('Exiting, offset is {} now, fs: {}', this.offset, this.file.size)();
    }
  }

  destroyFileConnection(message: DestroyFileConnectionMessage) {
    let isDecline = message.content === 'decline';
    let isSuccess = message.content === 'success';
    let isError = false;
    let status;
    if (isDecline) {
      status = FileTransferStatus.DECLINED_BY_OPPONENT;
      this.onDestroy();
    } else if (isSuccess) {
      status = FileTransferStatus.FINISHED;
      this.onDestroy();
    } else {
      status = FileTransferStatus.ERROR;
      isError = true;
    }
    let payload: SetSendingFileStatus = {
      transfer: this.opponentWsId,
      connId: this.connectionId,
      error: isError ? message.content : null,
      roomId: this.roomId,
      status
    };
    this.store.setSendingFileStatus(payload);
  }

  private commitErrorIntoStore(error: string) {
    let ssfs: SetSendingFileStatus = {
      status: FileTransferStatus.ERROR,
      roomId: this.roomId,
      error,
      connId: this.connectionId,
      transfer: this.opponentWsId
    };
    this.store.setSendingFileStatus(ssfs);
  }

  public ondatachannelclose(error: string): void {
    // channel could be closed in success and in error, we don't know why it was closed
    if (this.store.roomsDict[this.roomId].sendingFiles[this.connectionId].transfers[this.opponentWsId].status !== FileTransferStatus.FINISHED) {
      this.commitErrorIntoStore(error);
    }
  }
}
