import BaseTransferHandler from '@/webrtc/BaseTransferHandler';
import NotifierHandler from '@/utils/NotificationHandler';
import {SendingFile} from '@/types/model';
import WsHandler from '@/utils/WsHandler';
import {DefaultMessage, ReplyFileMessage} from '@/types/messages';
import FileSenderPeerConnection from '@/webrtc/FileSenderPeerConnection';
import {sub} from '@/utils/sub';
import Subscription from '@/utils/Subscription';
import {DefaultStore} from'@/utils/store';

export default class FileSender extends BaseTransferHandler {
  private file: File;

  constructor(roomId: number, connId: string, wsHandler: WsHandler, notifier: NotifierHandler, store: DefaultStore, file: File, time: number) {
    super(roomId, wsHandler, notifier, store);
    this.file = file;
    this.connectionId = connId;
    sub.subscribe(Subscription.getTransferId(connId), this);
    let payload: SendingFile = {
      roomId,
      connId,
      fileName: file.name,
      fileSize: file.size,
      time,
      transfers: {},
    };
    this.store.addSendingFile(payload);
  }

  protected readonly handlers: { [p: string]: SingleParamCB<DefaultMessage> } = {
    replyFile: this.replyFile,
    removePeerConnection: this.removePeerConnection
  };

  replyFile(message: ReplyFileMessage) {
    this.logger.debug('got mes {}', message)();
    new FileSenderPeerConnection(this.roomId, message.connId, message.opponentWsId, this.wsHandler, this.store, this.file, message.userId);
    this.webrtcConnnectionsIds.push(message.opponentWsId);

  }
}
