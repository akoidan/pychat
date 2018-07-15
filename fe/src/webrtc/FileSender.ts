import BaseTransferHandler from './BaseTransferHandler';
import NotifierHandler from '../utils/NotificationHandler';
import {FileTransferStatus, RootState} from '../types/model';
import WsHandler from '../utils/WsHandler';
import {Store} from 'vuex';
import {DefaultMessage, ReplyFileMessage} from '../types/messages';
import FileSenderPeerConnection from './FileSenderPeerConnection';
import {AddSendingFileTransfer} from '../types/types';

export default class FileSender extends BaseTransferHandler {
  private file: File;

  constructor(roomId: number, connId: string, removeReferenceFn: Function, wsHandler: WsHandler, notifier: NotifierHandler, store: Store<RootState>, file: File) {
    super(roomId, connId, removeReferenceFn, wsHandler, notifier, store);
    this.file = file;
  }

  protected readonly handlers: { [p: string]: SingleParamCB<DefaultMessage> } = {
    replyFile: this.replyFile
  };

  replyFile(message: ReplyFileMessage) {
    this.logger.debug('got mes {}', message)();
    this.peerConnections[message.opponentWsId] = new FileSenderPeerConnection(this.roomId, message.connId, message.opponentWsId, this.removeChildPeerReference, this.wsHandler, this.store);
    let asft:  AddSendingFileTransfer = {
      connId: message.connId,
      transferId: message.opponentWsId,
      roomId: 1,
      transfer: {
        status: FileTransferStatus.NOT_DECIDED_YET,
        error: null,
        total: this.file.size,
        uploaded: 0,
        userId: message.userId,
      }
    };
    this.store.commit('addSendingFileTransfer', asft);

  }
}
