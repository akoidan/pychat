import BaseTransferHandler from './BaseTransferHandler';
import NotifierHandler from '../utils/NotificationHandler';
import {FileTransferStatus, RootState, SendingFile} from '../types/model';
import WsHandler from '../utils/WsHandler';
import {Store} from 'vuex';
import {DefaultMessage, ReplyFileMessage} from '../types/messages';
import FileSenderPeerConnection from './FileSenderPeerConnection';
import {AddSendingFileTransfer, RemovePeerConnection} from '../types/types';
import {sub} from '../utils/sub';
import Subscription from '../utils/Subscription';

export default class FileSender extends BaseTransferHandler {
  private file: File;
  private webrtcConnnectionsIds: string[] = [];

  constructor(roomId: number, connId: string, wsHandler: WsHandler, notifier: NotifierHandler, store: Store<RootState>, file: File, time: number) {
    super(roomId, connId, wsHandler, notifier, store);
    this.file = file;
    let payload: SendingFile = {
      roomId,
      connId,
      fileName: file.name,
      fileSize: file.size,
      time,
      transfers: {},
    };
    this.store.commit('addSendingFile', payload);
  }

  protected readonly handlers: { [p: string]: SingleParamCB<DefaultMessage> } = {
    replyFile: this.replyFile,
    removePeerConnection: this.removePeerConnection
  };

  private removePeerConnection(payload: RemovePeerConnection) {
    this.webrtcConnnectionsIds.splice(this.webrtcConnnectionsIds.indexOf(payload.opponentWsId), 1);
    if (this.webrtcConnnectionsIds.length === 0) {
      this.onDestroy();
    }
  }

  closeAllPeerConnections(text) {
    this.webrtcConnnectionsIds.forEach(id => {
      sub.notify({
        action: 'destroy',
        handler: Subscription.getPeerConnectionId(this.connectionId, id)
      });
    });
  }


  replyFile(message: ReplyFileMessage) {
    this.logger.debug('got mes {}', message)();
    new FileSenderPeerConnection(this.roomId, message.connId, message.opponentWsId, this.wsHandler, this.store, this.file, message.userId);
    this.webrtcConnnectionsIds.push(message.opponentWsId);

  }
}
