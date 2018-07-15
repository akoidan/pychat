import loggerFactory from '../utils/loggerFactory';
import {Logger} from 'lines-logger';
import {SetReceivingFileStatus} from '../types/types';
import {DefaultMessage, OfferFile, WebRtcSetConnectionIdMessage} from '../types/messages';
import WsHandler from '../utils/WsHandler';
import {ReceivingFile, FileTransferStatus, RootState, SendingFile} from '../types/model';
import {Store} from 'vuex';
import FileSender from './FileSender';
import NotifierHandler from '../utils/NotificationHandler';
import {browserVersion, webrtcApi} from '../utils/singletons';
import MessageHandler from '../utils/MesageHandler';
import {sub} from '../utils/sub';
import {MAX_ACCEPT_FILE_SIZE_WO_FS_API} from '../utils/consts';
import {faviconUrl, requestFileSystem} from '../utils/htmlApi';
import {bytesToSize} from '../utils/utils';
import FileReceiverPeerConnection from './FileReceiveerPeerConnection';

export default class WebRtcApi extends MessageHandler {

  protected logger: Logger;

  private connections = {};
  private wsHandler: WsHandler;
  private store: Store<RootState>;
  private notifier: NotifierHandler;

  constructor(ws: WsHandler, store: Store<RootState>, notifier: NotifierHandler) {
    super();
    sub.subscribe('webrtc', this);
    this.wsHandler = ws;
    this.notifier = notifier;
    this.logger = loggerFactory.getLogger('WEBRTC', 'color: #960055');
    this.store = store;
  }

  protected readonly handlers: { [p: string]: SingleParamCB<DefaultMessage> }  = {
    offerFile: this.onofferFile
  };

  private onofferFile(message: OfferFile) {
    let limitExceeded = message.content.size > MAX_ACCEPT_FILE_SIZE_WO_FS_API && !requestFileSystem;
    let payload: ReceivingFile = {
      roomId: message.roomId,
      anchor: null,
      status: limitExceeded ? FileTransferStatus.ERROR : FileTransferStatus.NOT_DECIDED_YET,
      userId: message.userId,
      error: limitExceeded ? `Your browser doesn't support receiving files over ${bytesToSize(MAX_ACCEPT_FILE_SIZE_WO_FS_API)}` : null,
      connId: message.connId,
      fileName: message.content.name,
      time: message.time,
      upload: {
        uploaded: 0,
        total: message.content.size
      }
    };
    this.notifier.showNotification(this.store.state.allUsersDict[message.userId].user, {
      body: `Sends file ${message.content.name}`,
      requireInteraction: true,
      icon: faviconUrl
    });
    this.store.commit('addReceivingFile', payload);
    this.wsHandler.replyFile(message.connId, browserVersion);
    if (!limitExceeded) {
      this.connections[message.connId] = new FileReceiverPeerConnection(message.roomId, message.connId, message.opponentWsId, this.removeChildReference.bind(this), this.wsHandler, this.store, message.content.size);
    }
  }


  acceptFile(connId: string) {
    this.connections[connId].acceptFileReply();

  }

  declineFile(connId: string) {
    this.connections[connId].declineFileReply();
  }

  offerFile(file, channel) {
    this.wsHandler.offerFile(channel, browserVersion, file.name, file.size, (e: WebRtcSetConnectionIdMessage) => {
      if (e.connId) {
        this.connections[e.connId] = new FileSender(channel, e.connId, this.removeChildReference.bind(this), this.wsHandler, this.notifier, this.store, file);
        let payload: SendingFile = {
          roomId: channel,
          connId: e.connId,
          fileName: file.name,
          fileSize: file.size,
          time: e.time,
          transfers: {},
        };
        this.store.commit('addSendingFile', payload);
      }
    });
  }

  removeChildReference(id) {
    this.logger.log('Removing transferHandler with id {}, current connects are {}', id, this.connections)();
    sub.unsubscribe('webrtcTransfer:' + id);
    delete this.connections[id];
  }

  public retryFile(connId: string) {
    this.connections[connId].retryFilePeerConn();

  }
}