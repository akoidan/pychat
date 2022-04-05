import type NotifierHandler from "@/ts/classes/NotificationHandler";
import type {SendingFile} from "@/ts/types/model";
import type WsHandler from "@/ts/message_handlers/WsHandler";
import FileSenderPeerConnection from "@/ts/webrtc/file/FileSenderPeerConnection";
import Subscription from "@/ts/classes/Subscription";
import type {DefaultStore} from "@/ts/classes/DefaultStore";
import type {
  HandlerType,
  HandlerTypes,
} from "@/ts/types/messages/baseMessagesInterfaces";
import type {ReplyFileMessage} from "@/ts/types/messages/wsInMessages";
import {FileAndCallTransfer} from "@/ts/webrtc/FileAndCallTransfer";


export default class FileHandler extends FileAndCallTransfer {
  protected readonly handlers: HandlerTypes<keyof FileHandler, "webrtcTransfer:*"> = {
    replyFile: <HandlerType<"replyFile", "webrtcTransfer:*">> this.replyFile,
    checkTransferDestroy: <HandlerType<"checkTransferDestroy", "webrtcTransfer:*">> this.checkTransferDestroy,
  };

  private readonly file: File;

  public constructor(roomId: number, threadId: number | null, connId: string, wsHandler: WsHandler, notifier: NotifierHandler, store: DefaultStore, file: File, time: number, sub: Subscription) {
    super(roomId, wsHandler, notifier, store, sub);
    this.file = file;
    this.setConnectionId(connId);
    this.sub.subscribe(Subscription.getTransferId(connId), this);
    const payload: SendingFile = {
      roomId,
      connId,
      threadId,
      fileName: file.name,
      fileSize: file.size,
      time,
      transfers: {},
    };
    this.store.addSendingFile(payload);
  }

  public replyFile(message: ReplyFileMessage) {
    this.logger.debug("got mes {}", message)();
    new FileSenderPeerConnection(this.roomId, message.connId, message.opponentWsId, this.wsHandler, this.store, this.file, message.userId, this.sub);
  }
}
