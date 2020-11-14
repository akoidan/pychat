import BaseTransferHandler from '@/ts/webrtc/BaseTransferHandler';
import NotifierHandler from '@/ts/classes/NotificationHandler';
import { SendingFile } from '@/ts/types/model';
import WsHandler from '@/ts/message_handlers/WsHandler';
import { ReplyFileMessage } from '@/ts/types/messages';
import FileSenderPeerConnection from '@/ts/webrtc/file/FileSenderPeerConnection';
import { sub } from '@/ts/instances/subInstance';
import Subscription from '@/ts/classes/Subscription';
import { DefaultStore } from '@/ts/classes/DefaultStore';
import {
  HandlerType,
  HandlerTypes
} from '@/ts/types/types';

export default class FileHandler extends BaseTransferHandler {

  protected readonly handlers: HandlerTypes = {
    replyFile: <HandlerType>this.replyFile,
    removePeerConnection: <HandlerType>this.removePeerConnection
  };
  private readonly file: File;

  constructor(roomId: number, connId: string, wsHandler: WsHandler, notifier: NotifierHandler, store: DefaultStore, file: File, time: number) {
    super(roomId, wsHandler, notifier, store);
    this.file = file;
    this.connectionId = connId;
    sub.subscribe(Subscription.getTransferId(connId), this);
    const payload: SendingFile = {
      roomId,
      connId,
      fileName: file.name,
      fileSize: file.size,
      time,
      transfers: {}
    };
    this.store.addSendingFile(payload);
  }

  public replyFile(message: ReplyFileMessage) {
    this.logger.debug('got mes {}', message)();
    new FileSenderPeerConnection(this.roomId, message.connId, message.opponentWsId, this.wsHandler, this.store, this.file, message.userId);
    this.webrtcConnnectionsIds.push(message.opponentWsId);

  }
}
