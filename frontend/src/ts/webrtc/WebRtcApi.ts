import {NotifyCallActiveWsInBody} from "@common/ws/message/webrtc/notify.call.active";
import type {
  NotifyCallActiveWsInMessage,
} from "@common/ws/message/webrtc/notify.call.active";
import type {OfferMessageWsInMessage} from "@common/ws/message/webrtc/offer.message";
import type {HandlerName} from "@common/ws/common";
import type {ChangeP2pRoomInfoMessage} from "@/ts/types/messages/inner/change.p2p.room.info";
import {
  ChangeOnlineBody,
} from "@/ts/types/messages/inner/change.user.online.info";
import type {
  ChangeOnlineMessage,
} from "@/ts/types/messages/inner/change.user.online.info";
import type {InternetAppearMessage} from "@/ts/types/messages/inner/internet.appear";
import type {LogoutMessage} from "@/ts/types/messages/inner/logout";

import loggerFactory from "@/ts/instances/loggerFactory";
import type {Logger} from "lines-logger";
import type WsApi from "@/ts/message_handlers/WsApi";
import type {ReceivingFile} from "@/ts/types/model";
import {FileTransferStatus} from "@/ts/types/model";
import FileHandler from "@/ts/webrtc/file/FileHandler";
import type NotifierHandler from "@/ts/classes/NotificationHandler";
import {MAX_ACCEPT_FILE_SIZE_WO_FS_API} from "@/ts/utils/consts";
import {requestFileSystem, resolveMediaUrl} from "@/ts/utils/htmlApi";
import FileReceiverPeerConnection from "@/ts/webrtc/file/FileReceiveerPeerConnection";
import Subscription from "@/ts/classes/Subscription";
import CallHandler from "@/ts/webrtc/call/CallHandler";
import faviconUrl from "@/assets/img/favicon.ico";
import type {DefaultStore} from "@/ts/classes/DefaultStore";
import {browserVersion} from "@/ts/utils/runtimeConsts";
import MessageTransferHandler from "@/ts/webrtc/message/MessageTransferHandler";
import {bytesToSize} from "@/ts/utils/pureFunctions";
import type {VideoType} from "@/ts/types/types";

import type {MessageHelper} from "@/ts/message_handlers/MessageHelper";
import type {MessageSenderProxy} from "@/ts/message_handlers/MessageSenderProxy";
import type {
  OfferFileResponse,
} from "@common/ws/message/webrtc/offer.file";
import {
  OfferFileBody,
} from "@common/ws/message/webrtc/offer.file";
import {Subscribe} from "@/ts/utils/pubsub";
import {ChangeP2pRoomInfoMessageBody} from "@/ts/types/messages/inner/change.p2p.room.info";
import type {
  OfferCallWsInMessage,
} from "@common/ws/message/webrtc/offer.call";
import {
  OfferCallWsInBody,
} from "@common/ws/message/webrtc/offer.call";
import {OfferMessageWsInBody} from "@common/ws/message/webrtc/offer.message";
import type {AnswerCallMessage} from "@/ts/types/messages/inner/answer.call";
import type {DeclineCallMessage} from "@/ts/types/messages/inner/decline.call";
import type {VideoAnswerCallMessage} from "@/ts/types/messages/inner/video.answer.call";
import type {DeclineSendingMessage} from "@/ts/types/messages/peer-connection/decline.sending";
import type {DeclineFileReply} from "@/ts/types/messages/peer-connection/decline.file.reply";
import type {RetryFileReply} from "@/ts/types/messages/peer-connection/retry.file.reply";
import {WebRtcSetConnectionIdBody} from "@common/model/webrtc.base";
import {AcceptFileReplyInnerSystemMessage} from "@/ts/types/messages/peer-connection/accept.file.reply";


export default class WebRtcApi {
  protected logger: Logger;

  private readonly wsHandler: WsApi;

  private readonly store: DefaultStore;

  private readonly notifier: NotifierHandler;

  private readonly callHandlers: Record<number, CallHandler> = {};

  private readonly messageHandlers: Record<number, MessageTransferHandler> = {};

  private readonly messageHelper: MessageHelper;

  private messageSenderProxy!: MessageSenderProxy; // Via setter

  private readonly sub: Subscription;

  public constructor(ws: WsApi, store: DefaultStore, notifier: NotifierHandler, messageHelper: MessageHelper, sub: Subscription) {
    this.sub = sub;
    this.sub.subscribe("webrtc", this);
    this.wsHandler = ws;
    this.notifier = notifier;
    this.logger = loggerFactory.getLogger("WEBRTC");
    this.store = store;
    this.messageHelper = messageHelper;
  }


  public setMessageSenderProxy(messageSenderProxy: MessageSenderProxy) {
    this.messageSenderProxy = messageSenderProxy;
  }

  @Subscribe<OfferCallWsInMessage>()
  public offerCall(message: OfferCallWsInBody) {
    this.getCallHandler(message.roomId).initAndDisplayOffer(message);
  }

  public joinCall(roomId: number) {
    this.getCallHandler(roomId).joinCall();
  }

  @Subscribe<ChangeP2pRoomInfoMessage>()
  public async changeDevices(m: ChangeP2pRoomInfoMessageBody): Promise<void> {
    this.logger.log("change devices {}", m)();
    this.updateCallTransfer(m);
    await this.updateMessagesTransfer(m);
  }

  initAndSyncMessages() {
    this.store.roomsArray.forEach((room) => {
      if (room.p2p) {
        this.getMessageHandler(room.id).initOrSync();
      }
    });
  }

  @Subscribe<InternetAppearMessage>()
  public internetAppear() {
    this.initAndSyncMessages();
  }

  @Subscribe<NotifyCallActiveWsInMessage>()
  public notifyCallActive(m: NotifyCallActiveWsInBody) {
    this.getCallHandler(m.roomId).addOpponent(m.connId, m.userId, m.opponentWsId);
  }

  @Subscribe<ChangeOnlineMessage>()
  public changeOnline(message: ChangeOnlineBody) {
    this.store.roomsArray.filter((r) => r.callInfo.callActive && r.users.includes(message.userId)).forEach((r) => {
      if (message.changeType === "appear_online") {
        this.getCallHandler(r.id).createCallPeerConnection({
          opponentWsId: message.opponentWsId,
          userId: message.userId,
        });
        this.wsHandler.notifyCallActive({
          opponentWsId: message.opponentWsId,
          connectionId: this.getCallHandler(r.id).getConnectionId(),
          roomId: r.id,
        });
      } else {
        // We dont need to destroy PC here, since disconnect from the server doesn't mean we lost the pear
        if (this.callHandlers[r.id]) {
          this.callHandlers[r.id].removeOpponent(message.opponentWsId);
        }
      }
    });
  }

  @Subscribe<OfferMessageWsInMessage>()
  public offerMessage(message: OfferMessageWsInBody) {
    this.getMessageHandler(message.roomId).acceptConnection(message);
  }

  public acceptFile(connId: string, webRtcOpponentId: string) {
    this.sub.notify<AcceptFileReplyInnerSystemMessage>({
      action: "acceptFileReply",
      handler: Subscription.getPeerConnectionId(connId, webRtcOpponentId),
      data: null,
    });
  }

  public declineSending(connId: string, webRtcOpponentId: string) {
    this.sub.notify<DeclineSendingMessage>({
      action: "declineSending",
      handler: Subscription.getPeerConnectionId(connId, webRtcOpponentId),
      data: null,
    });
  }

  public declineFile(connId: string, webRtcOpponentId: string) {
    this.sub.notify<DeclineFileReply>({
      action: "declineFileReply",
      handler: Subscription.getPeerConnectionId(connId, webRtcOpponentId),
      data: null,
    });
  }

  public async sendFileOffer(file: File, channel: number, threadId: number | null) {
    if (file.size > 0) {
      const e: WebRtcSetConnectionIdBody = await this.wsHandler.offerFile(channel, browserVersion, file.name, file.size, threadId);
      new FileHandler(channel, threadId, e.connId, this.wsHandler, this.notifier, this.store, file, this.wsHandler.convertServerTimeToPC(e.time), this.sub);
    } else {
      this.store.growlError(`File ${file.name} size is 0. Skipping sending it...`);
    }
  }

  public retryFile(connId: string, webRtcOpponentId: string) {
    this.sub.notify<RetryFileReply>({
      action: "retryFileReply",
      handler: Subscription.getPeerConnectionId(connId, webRtcOpponentId),
      data: null,
    });
  }

  public getCallHandler(roomId: number): CallHandler {
    if (!this.callHandlers[roomId]) {
      this.callHandlers[roomId] = new CallHandler(roomId, this.wsHandler, this.notifier, this.store, this.sub);
    }

    return this.callHandlers[roomId];
  }

  public getMessageHandler(roomId: number): MessageTransferHandler {
    if (!this.messageHandlers[roomId]) {
      this.messageHandlers[roomId] = new MessageTransferHandler(roomId, this.wsHandler, this.notifier, this.store, this.messageHelper, this.sub);
    }

    return this.messageHandlers[roomId];
  }

  public startCall(roomId: number) {
    this.getCallHandler(roomId).offerCall();
  }

  public answerCall(connId: string) {
    const message: AnswerCallMessage = {
      action: "answerCall",
      handler: Subscription.getTransferId(connId),
      data: null,
    };
    this.sub.notify(message);
  }

  public declineCall(connId: string) {
    const message: DeclineCallMessage = {
      action: "declineCall",
      handler: Subscription.getTransferId(connId),
      data: null,
    };
    this.sub.notify(message);
  }

  public videoAnswerCall(connId: string) {
    const m: VideoAnswerCallMessage = {
      action: "videoAnswerCall",
      handler: Subscription.getTransferId(connId),
      data: null,
    };
    this.sub.notify(m);
  }

  public hangCall(roomId: number) {
    this.callHandlers[roomId].hangCall();
  }

  public updateConnection(roomId: number) {
    this.callHandlers[roomId].updateConnection();
  }

  public setCanvas(roomId: number, canvas: HTMLCanvasElement) {
    this.getCallHandler(roomId).setCanvasElement(canvas);
  }

  public toggleDevice(roomId: number, videoType: VideoType) {
    this.callHandlers[roomId].toggleDevice(videoType);
  }

  @Subscribe<LogoutMessage>()
  public logout() {
    for (const k in this.callHandlers) {
      this.callHandlers[k].hangCall();
    }
    for (const k in this.messageHandlers) {
      this.messageHandlers[k].destroyThisTransferHandler();
    }
  }

  @Subscribe<OfferFileResponse>()
  public offerFile(message: OfferFileBody): void {
    const limitExceeded = message.size > MAX_ACCEPT_FILE_SIZE_WO_FS_API && !requestFileSystem;
    const payload: ReceivingFile = {
      roomId: message.roomId,
      opponentWsId: message.opponentWsId,
      anchor: null,
      threadId: message.threadId,
      status: limitExceeded ? FileTransferStatus.ERROR : FileTransferStatus.NOT_DECIDED_YET,
      userId: message.userId,
      error: limitExceeded ? `Your browser doesn't support receiving files over ${bytesToSize(MAX_ACCEPT_FILE_SIZE_WO_FS_API)}` : null,
      connId: message.connId,
      fileName: message.name,
      time: this.wsHandler.convertServerTimeToPC(message.time),
      upload: {
        uploaded: 0,
        total: message.size,
      },
    };
    this.notifier.showNotification(this.store.allUsersDict[message.userId].username, {
      body: `Sends file ${message.name}`,
      requireInteraction: true,
      icon: resolveMediaUrl(this.store.allUsersDict[message.userId].thumbnail) || faviconUrl,
      replaced: 1,
    });
    this.store.addReceivingFile(payload);
    if (payload.threadId) {
      this.messageSenderProxy.getMessageSender(message.roomId).loadMessages(payload.roomId, [payload.threadId]);
    }
    this.wsHandler.replyFile(message.connId, browserVersion);
    if (!limitExceeded) {
      new FileReceiverPeerConnection(message.roomId, message.connId, message.opponentWsId, this.wsHandler, this.store, message.size, this.sub);
    }
  }

  private updateCallTransfer(m: ChangeP2pRoomInfoMessageBody) {
    if (m.changeType === "someone_joined" || m.changeType === "someone_left") {
      this.store.roomsArray.filter((r) => r.callInfo.callActive && r.users.includes(m.userId!)).forEach((r) => {
        if (m.changeType === "someone_joined") {
          if (this.store.onlineDict[m.userId!]) {
            this.store.onlineDict[m.userId!].forEach((opponentWsId: string) => {
              this.getCallHandler(r.id).createCallPeerConnection({
                opponentWsId,
                userId: m.userId!,
              });
              this.wsHandler.notifyCallActive({
                opponentWsId,
                connectionId: this.getCallHandler(r.id).getConnectionId(),
                roomId: r.id,
              });
            });
          }
        } else {
          // We dont need to destroy PC here, since disconnect from the server doesn't mean we lost the pear
          if (this.callHandlers[r.id]) {
            this.callHandlers[r.id].removeUserOpponent(m.userId!);
          }
        }
      });
    }
  }

  private async updateMessagesTransfer(m: ChangeP2pRoomInfoMessageBody) {
    if (m.changeType === "i_deleted") { // Destroy my room
      const mh: MessageTransferHandler = this.messageHandlers[m.roomId];
      if (mh) {
        mh.destroyThisTransferHandler();
      }
      delete this.messageHandlers[m.roomId];
    } else if (this.store.roomsDict[m.roomId]?.p2p) {

      /*
       *  'someone_left' - destroy peer connection in this room
       *  'room_created' - send to everyone when new room is created
       *  'someone_joined' - send to everyone when someone joins the room, but the member who joins receives 'invited'
       */
      await this.getMessageHandler(m.roomId).initOrSync();
    }
  }
}
