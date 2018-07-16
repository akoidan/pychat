import ReceiverPeerConnection from './ReceiverPeerConnection';
import {SetReceivingFileStatus, SetReceivingFileUploaded} from '../types/types';
import {FileTransferStatus, RootState} from '../types/model';
import {DefaultMessage} from '../types/messages';
import {bounce, bytesToSize} from '../utils/utils';
import WsHandler from '../utils/WsHandler';
import {Store} from 'vuex';
import {requestFileSystem} from '../utils/htmlApi';
import {MAX_ACCEPT_FILE_SIZE_WO_FS_API, MAX_BUFFER_SIZE} from '../utils/consts';
import FilePeerConnection from './FilePeerConnection';

export default class FileReceiverPeerConnection extends ReceiverPeerConnection {
  private fileSize: number;
  private fileEntry: any;
  private fileWriter: any;
  private blobsQueue = [];
  private receiveBuffer = [];
  private receivedSize = 0;
  private recevedUsingFile = false;
  private filePeerConnection: FilePeerConnection;

  protected readonly handlers: { [p: string]: SingleParamCB<DefaultMessage> } = {
    sendRtcData: this.onsendRtcData,
    retryFile: this.retryFileAccepted,
    retryFileReply: this.retryFileReply,
    acceptFileReply: this.acceptFileReply,
    declineFileReply: this.declineFileReply,
    destroyFileConnection: this.destroyFileConnection,
  };

  private noSpam: (cb) => void;
  private retryFileSend: number = 0;

  constructor(roomId: number, connId: string, opponentWsId: string, wsHandler: WsHandler, store: Store<RootState>, size: number) {
    super(roomId, connId, opponentWsId, wsHandler, store);
    this.fileSize = size;
    this.noSpam = bounce(100);
    this.filePeerConnection = new FilePeerConnection(this);
  }

  private destroyFileConnection() {
    let payload: SetReceivingFileStatus = {
      error: null,
      status: FileTransferStatus.DECLINED_BY_OPPONENT,
      connId: this.connectionId,
      roomId: this.roomId
    };
    this.store.commit('setReceivingFileStatus', payload);
    this.onDestroy();
  }

  private initFileSystemApi(cb) {
    this.logger.debug('Creating temp location {}', bytesToSize(this.fileSize))();
    if (requestFileSystem) {
      requestFileSystem(window['TEMPORARY'], this.fileSize, (fs) => {
        fs.root.getFile(this.connectionId, {create: true}, (fileEntry) => {
          this.fileEntry = fileEntry;
          this.fileEntry.createWriter((fileWriter) => {
            this.fileWriter = fileWriter;
            if (!this.fileWriter.WRITING) {
              this.fileWriter.WRITING = 1;
            }
            this.fileWriter.onwriteend = this.onWriteEnd.bind(this);
            this.logger.log('FileWriter is created')();
            cb(true);
          }, this.fileSystemErr(1, cb, fs));

        }, this.fileSystemErr(2, cb, fs));
      }, this.fileSystemErr(3, cb, null));
    } else {
      cb(false);
    }
  }

  private retryFileAccepted() {
    let payload: SetReceivingFileStatus = {
      error: null,
      status: FileTransferStatus.IN_PROGRESS,
      connId: this.connectionId,
      roomId: this.roomId
    };
    this.store.commit('setReceivingFileStatus', payload);
  }

  protected onChannelMessage(event) {
    this.receiveBuffer.push(event.data);
    // chrome accepts bufferArray (.byteLength). firefox accepts blob (.size)
    var receivedSize = event.data.byteLength ? event.data.byteLength : event.data.size;
    this.receivedSize += receivedSize;
    this.syncBufferWithFs();
    this.noSpam(() => {
      let payload: SetReceivingFileUploaded = {
        connId: this.connectionId,
        roomId: this.roomId,
        uploaded: this.receivedSize
      };
      this.store.commit('setReceivingFileUploaded', payload);
    });
    this.assembleFileIfDone();
  };

  public retryFileReply() {
    let now = Date.now();
    if (now - this.retryFileSend > 5000) {
      this.retryFileSend = now;
      this.waitForAnswer();
    }

  }

  private syncBufferWithFs() {
    if (this.fileWriter && (this.receiveBuffer.length > MAX_BUFFER_SIZE || this.isDone())) {
      this.recevedUsingFile = true;
      let blob = new Blob(this.receiveBuffer);
      this.receiveBuffer = [];
      if (this.fileWriter.readyState == this.fileWriter.WRITING) {
        this.blobsQueue.push(blob);
      } else {
        this.fileWriter.write(blob);
      }
    }
  }

  private onWriteEnd() {
    if (this.blobsQueue.length > 0) {
      this.fileWriter.write(this.blobsQueue.shift());
    } else {
      this.assembleFileIfDone();
    }
  }
  private isDone() {
    return this.receivedSize === this.fileSize;
  };

  private assembleFileIfDone () {
    if (this.isDone()) {
      let received = this.recevedUsingFile ? this.fileEntry.toURL() : URL.createObjectURL(new window.Blob(this.receiveBuffer));
      this.logger.log("File is received")();
      this.wsHandler.destroyFileConnection(this.connectionId, 'success');
      this.receiveBuffer = []; //clear buffer
      this.receivedSize = 0;
      let payload: SetReceivingFileStatus = {
        anchor: received,
        error: null,
        status: FileTransferStatus.FINISHED,
        connId: this.connectionId,
        roomId: this.roomId
      };
      this.store.commit('setReceivingFileStatus', payload);
      this.filePeerConnection.closeEvents();
      this.onDestroy();
    }
  };

  private onExceededQuota(fs, cb) {
    this.logger.log('Quota exceeded, trying to clear it')();
    fs.root.createReader().readEntries(function (entries) {
      entries.forEach( (e) => {
        function onRemove() {
          this.logger.log('Removed {}', e.fullPath)();
        }

        if (e.isFile) {
          e.remove(onRemove);
        } else {
          e.removeRecursively(onRemove);
        }
      });
      cb(true);
    });
  }

  private fileSystemErr(errN, cb, fs) {
    return  (e) => {
      this.logger.error('FileSystemApi Error {}: {}, code {}', errN, e.message || e, e.code)();
      if (fs && e.code === 22) {
        this.onExceededQuota(fs, cb);
      } else {
        this.store.dispatch('FileSystemApi Error: ' + e.message || e.code || e);
      }
      cb(false);
    };
  }

  private  gotReceiveChannel (event) {
    this.logger.debug('Received new channel')();
    this.sendChannel = event.channel;
    this.sendChannel.onmessage = this.onChannelMessage.bind(this);
    this.sendChannel.onopen = () => {
      this.logger.debug('Channel opened')();
    };
    this.sendChannel.onclose = () => this.logger.log('Closed channel ')();
  }

  public declineFileReply() {
    this.wsHandler.destroyFileConnection(this.connectionId, 'decline');
    let rf: SetReceivingFileStatus = {
      roomId: this.roomId,
      connId: this.connectionId,
      status: FileTransferStatus.DECLINED_BY_YOU
    };
    this.store.commit('setReceivingFileStatus', rf);
    this.onDestroy();
  }

  public acceptFileReply() {
    this.initFileSystemApi((fileSystemSucess) => {
        if (fileSystemSucess || this.fileSize < MAX_ACCEPT_FILE_SIZE_WO_FS_API) {
          this.waitForAnswer();
          let rf: SetReceivingFileStatus = {
            roomId: this.roomId,
            connId: this.connectionId,
            error: 'Establishing connection...',
            status: FileTransferStatus.ERROR
          };
          this.store.commit('setReceivingFileStatus', rf);

        } else {
          let content = `Browser doesn't support acepting file sizes over ${bytesToSize(MAX_ACCEPT_FILE_SIZE_WO_FS_API)}`;
          this.wsHandler.destroyFileConnection(this.connectionId, content);
          this.onDestroy();
        }
    });
  }

  private waitForAnswer() {
    this.createPeerConnection();
    this.pc.ondatachannel = this.gotReceiveChannel.bind(this);
    this.wsHandler.acceptFile(this.connectionId, this.receivedSize);
  }

  oniceconnectionstatechange(): void {
    this.filePeerConnection.oniceconnectionstatechange();
  }

  ondatachannelclose(text): void {
    let rf: SetReceivingFileStatus = {
      roomId: this.roomId,
      connId: this.connectionId,
      status: FileTransferStatus.ERROR,
      error: text
    };
    this.store.commit('setReceivingFileStatus', rf);
  }

}