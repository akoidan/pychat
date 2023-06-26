import type {ReplyFileWsInMessage} from "@common/ws/message/webrtc-transfer/reply.file";
import type NotifierHandler from "@/ts/classes/NotificationHandler";
import type {SendingFile} from "@/ts/types/model";
import type WsApi from "@/ts/message_handlers/WsApi";
import FileSenderPeerConnection from "@/ts/webrtc/file/FileSenderPeerConnection";
import Subscription from "@/ts/classes/Subscription";
import type {DefaultStore} from "@/ts/classes/DefaultStore";
import {FileAndCallTransfer} from "@/ts/webrtc/FileAndCallTransfer";
import {Subscribe} from "@/ts/utils/pubsub";
import {ReplyFileWsInBody} from "@common/ws/message/webrtc-transfer/reply.file";


export default class FileHandler extends FileAndCallTransfer {

  private readonly file: File;

  public constructor(roomId: number, threadId: number | null, connId: string, wsHandler: WsApi, notifier: NotifierHandler, store: DefaultStore, file: File, time: number, sub: Subscription) {
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


  @Subscribe<ReplyFileWsInMessage>()
  public replyFile(message: ReplyFileWsInBody) {
    this.logger.debug("got mes {}", message)();
    new FileSenderPeerConnection(this.roomId, message.connId, message.opponentWsId, this.wsHandler, this.store, this.file, message.userId, this.sub);
  }
}
