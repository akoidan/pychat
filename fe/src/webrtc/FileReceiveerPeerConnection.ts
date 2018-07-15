import ReceiverPeerConnection from './ReceiverPeerConnection';
import {SetReceivingFileStatus, SetReceivingFileUploaded} from '../types/types';
import {FileTransferStatus, RootState} from '../types/model';
import {DefaultMessage} from '../types/messages';
import {bytesToSize} from '../utils/utils';
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
    sendRtcData: this.onsendRtcData
  };

  constructor(roomId: number, connId: string, opponentWsId: string, removeChildReference: (id) => void, wsHandler: WsHandler, store: Store<RootState>, size: number) {
    super(roomId, connId, opponentWsId, removeChildReference, wsHandler, store);
    this.fileSize = size;
    this.filePeerConnection = new FilePeerConnection(this);
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

  protected  onChannelMessage(event) {
    super.onChannelMessage(event);
    this.receiveBuffer.push(event.data);
    // chrome accepts bufferArray (.byteLength). firefox accepts blob (.size)
    var receivedSize = event.data.byteLength ? event.data.byteLength : event.data.size;
    this.receivedSize += receivedSize;
    this.syncBufferWithFs();
    let payload: SetReceivingFileUploaded = {
      connId: this.connectionId,
      roomId: this.roomId,
      uploaded: this.receivedSize
    };
    this.store.commit('setReceivingFileUploaded', payload);
    this.assembleFileIfDone();
  };
  

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

  private  assembleFileIfDone () {
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


  private  fileSystemErr(errN, cb, fs) {
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
    this.removeChildPeerReferenceFn(this.connectionId);
    let rf: SetReceivingFileStatus = {
      roomId: this.roomId,
      connId: this.connectionId,
      status: FileTransferStatus.DECLINED
    };
    this.store.commit('setReceivingFileStatus', rf);
  }

  public acceptFileReply() {
    this.initFileSystemApi((fileSystemSucess) => {
        if (fileSystemSucess || this.fileSize < MAX_ACCEPT_FILE_SIZE_WO_FS_API) {
          this.createPeerConnection();
          this.pc.ondatachannel =  this.gotReceiveChannel.bind(this);
          this.wsHandler.acceptFile(this.connectionId);
          let rf: SetReceivingFileStatus = {
            roomId: this.roomId,
            connId: this.connectionId,
            status: FileTransferStatus.IN_PROGRESS
          };
          this.store.commit('setReceivingFileStatus', rf);

        } else {
          let content = `Browser doesn't support acepting file sizes over ${bytesToSize(MAX_ACCEPT_FILE_SIZE_WO_FS_API)}`;
          this.wsHandler.destroyFileConnection(this.connectionId, content);
          this.removeChildPeerReferenceFn(content);
        }
    });
  }

  // public acceptFileReply() {
  //   this.peerConnections[this.offerOpponentWsId] = new FileReceiverPeerConnection(
  //       this.connectionId,
  //       this.offerOpponentWsId,
  //       this.fileName,
  //       this.fileSize,
  //       this.removeChildPeerReference
  //   );
  //
  //   this.peerConnections[this.offerOpponentWsId].initFileSystemApi(this.sendAccessFileSuccess);
  //   this.connections[connId].acceptFileReply()
  //
  //
  //   this.wsHandler.acceptFile(connId);
  //   let rf: SetReceivingFileStatus = {
  //     roomId, connId, status: FileTransferStatus.IN_PROGRESS
  //   };
  //   this.store.commit('setReceivingFileStatus', rf);
  //
  //   this.peerConnections[this.offerOpponentWsId] = new FileReceiverPeerConnection(
  //       this.connectionId,
  //       this.offerOpponentWsId,
  //       this.fileName,
  //       this.fileSize,
  //       this.removeChildPeerReference
  //   );
  //   let div = document.createElement('DIV');
  //   this.dom.body.appendChild(div);
  //   let db = new DownloadBar(div, this.fileSize, this.dom.connectionStatus);
  //   this.peerConnections[this.offerOpponentWsId].setDownloadBar(db); // should be before initFileSystemApi
  //   this.peerConnections[this.offerOpponentWsId].initFileSystemApi(this.sendAccessFileSuccess);
  // }


  oniceconnectionstatechange(): void {
    this.filePeerConnection.oniceconnectionstatechange();
  }

}