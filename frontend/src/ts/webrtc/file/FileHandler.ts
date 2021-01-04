import BaseTransferHandler from '@/ts/webrtc/BaseTransferHandler';
import NotifierHandler from '@/ts/classes/NotificationHandler';
import { SendingFile } from '@/ts/types/model';
import WsHandler from '@/ts/message_handlers/WsHandler';
import FileSenderPeerConnection from '@/ts/webrtc/file/FileSenderPeerConnection';
import { sub } from '@/ts/instances/subInstance';
import Subscription from '@/ts/classes/Subscription';
import { DefaultStore } from '@/ts/classes/DefaultStore';
import {
  HandlerType,
  HandlerTypes
} from '@/ts/types/messages/baseMessagesInterfaces';
import { ReplyFileMessage } from '@/ts/types/messages/wsInMessages';
import { FileAndCallTransfer } from '@/ts/webrtc/FileAndCallTransfer';


export default class FileHandler extends FileAndCallTransfer {

  protected readonly handlers: HandlerTypes<keyof FileHandler, 'webrtcTransfer:*'> = {
    replyFile: <HandlerType<'replyFile', 'webrtcTransfer:*'>>this.replyFile,
    checkTransferDestroy: <HandlerType<'checkTransferDestroy', 'webrtcTransfer:*'>>this.checkTransferDestroy
  };
  private readonly file: File;

  constructor(roomId: number, connId: string, wsHandler: WsHandler, notifier: NotifierHandler, store: DefaultStore, file: File, time: number) {
    super(roomId, wsHandler, notifier, store);
    this.file = file;
    this.setConnectionId(connId);
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

  }
}
