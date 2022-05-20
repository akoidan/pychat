import type {
  HandlerType,
  HandlerTypes,
} from "@common/ws/common";
import {ChangeP2pRoomInfoMessage} from "@/ts/types/messages/inner/change.p2p.room.info";
import {ChangeUserOnlineInfoMessage} from "@/ts/types/messages/inner/change.user.online.info";
import {InternetAppearMessage} from "@/ts/types/messages/inner/internet.appear";
import {LogoutMessage} from "@/ts/types/messages/inner/logout";

import loggerFactory from "@/ts/instances/loggerFactory";
import type {Logger} from "lines-logger";
import type WsHandler from "@/ts/message_handlers/WsHandler";
import type {ReceivingFile} from "@/ts/types/model";
import {FileTransferStatus} from "@/ts/types/model";
import FileHandler from "@/ts/webrtc/file/FileHandler";
import type NotifierHandler from "@/ts/classes/NotificationHandler";
import MessageHandler from "@/ts/message_handlers/MesageHandler";
import {MAX_ACCEPT_FILE_SIZE_WO_FS_API} from "@/ts/utils/consts";
import {
  requestFileSystem,
  resolveMediaUrl,
} from "@/ts/utils/htmlApi";
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


export default class WebRtcApi extends MessageHandler {
  protected logger: Logger;

  protected readonly handlers: HandlerTypes<keyof WebRtcApi, "webrtc"> = {
    offerFile: <HandlerType<"offerFile", "webrtc">> this.offerFile,
    changeDevices: <HandlerType<"changeDevices", "webrtc">> this.changeDevices,
    offerCall: <HandlerType<"offerCall", "webrtc">> this.offerCall,
    offerMessage: <HandlerType<"offerMessage", "webrtc">> this.offerMessage,
    changeOnline: <HandlerType<"changeOnline", "webrtc">> this.changeOnline,
    logout: <HandlerType<"logout", HandlerName>> this.logout,
    internetAppear: <HandlerType<"internetAppear", HandlerName>> this.internetAppear,
    notifyCallActive: <HandlerType<"notifyCallActive", HandlerName>> this.notifyCallActive,
  };

  private readonly wsHandler: WsHandler;

  private readonly store: DefaultStore;

  private readonly notifier: NotifierHandler;

  private readonly callHandlers: Record<number, CallHandler> = {};

  private readonly messageHandlers: Record<number, MessageTransferHandler> = {};

  private readonly messageHelper: MessageHelper;

  private messageSenderProxy!: MessageSenderProxy; // Via setter

  private readonly sub: Subscription;

  public constructor(ws: WsHandler, store: DefaultStore, notifier: NotifierHandler, messageHelper: MessageHelper, sub: Subscription) {
    super();
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

  public offerCall(message: OfferCall) {
    this.getCallHandler(message.roomId).initAndDisplayOffer(message);
  }

  public joinCall(roomId: number) {
    this.getCallHandler(roomId).joinCall();
  }

  public async changeDevices(m: ChangeP2pRoomInfoMessage): Promise<void> {
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

  public internetAppear(m: InternetAppearMessage) {
    this.initAndSyncMessages();
  }

  public notifyCallActive(m: NotifyCallActiveMessage) {
    this.getCallHandler(m.roomId).addOpponent(m.connId, m.userId, m.opponentWsId);
  }

  public changeOnline(message: ChangeUserOnlineInfoMessage) {
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

  public offerMessage(message: OfferMessage) {
    this.getMessageHandler(message.roomId).acceptConnection(message);
  }

  public acceptFile(connId: string, webRtcOpponentId: string) {
    this.sub.notify({
      action: "acceptFileReply",
      handler: Subscription.getPeerConnectionId(connId, webRtcOpponentId),
    });
  }

  public declineSending(connId: string, webRtcOpponentId: string) {
    this.sub.notify({
      action: "declineSending",
      handler: Subscription.getPeerConnectionId(connId, webRtcOpponentId),
    });
  }

  public declineFile(connId: string, webRtcOpponentId: string) {
    this.sub.notify({
      action: "declineFileReply",
      handler: Subscription.getPeerConnectionId(connId, webRtcOpponentId),
    });
  }

  public async sendFileOffer(file: File, channel: number, threadId: number | null) {
    if (file.size > 0) {
      const e: WebRtcSetConnectionIdMessage = await this.wsHandler.offerFile(channel, browserVersion, file.name, file.size, threadId);
      new FileHandler(channel, threadId, e.connId, this.wsHandler, this.notifier, this.store, file, this.wsHandler.convertServerTimeToPC(e.time), this.sub);
    } else {
      this.store.growlError(`File ${file.name} size is 0. Skipping sending it...`);
    }
  }

  public retryFile(connId: string, webRtcOpponentId: string) {
    this.sub.notify({
      action: "retryFileReply",
      handler: Subscription.getPeerConnectionId(connId, webRtcOpponentId),
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
    this.sub.notify({
      action: "answerCall",
      handler: Subscription.getTransferId(connId),
    });
  }

  public declineCall(connId: string) {
    this.sub.notify({
      action: "declineCall",
      handler: Subscription.getTransferId(connId),
    });
  }

  public videoAnswerCall(connId: string) {
    this.sub.notify({
      action: "videoAnswerCall",
      handler: Subscription.getTransferId(connId),
    });
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

  public logout(m: LogoutMessage) {
    for (const k in this.callHandlers) {
      this.callHandlers[k].hangCall();
    }
    for (const k in this.messageHandlers) {
      this.messageHandlers[k].destroyThisTransferHandler();
    }
  }

  public offerFile(message: OfferFile): void {
    const limitExceeded = message.content.size > MAX_ACCEPT_FILE_SIZE_WO_FS_API && !requestFileSystem;
    const payload: ReceivingFile = {
      roomId: message.roomId,
      opponentWsId: message.opponentWsId,
      anchor: null,
      threadId: message.threadId,
      status: limitExceeded ? FileTransferStatus.ERROR : FileTransferStatus.NOT_DECIDED_YET,
      userId: message.userId,
      error: limitExceeded ? `Your browser doesn't support receiving files over ${bytesToSize(MAX_ACCEPT_FILE_SIZE_WO_FS_API)}` : null,
      connId: message.connId,
      fileName: message.content.name,
      time: this.wsHandler.convertServerTimeToPC(message.time),
      upload: {
        uploaded: 0,
        total: message.content.size,
      },
    };
    this.notifier.showNotification(this.store.allUsersDict[message.userId].username, {
      body: `Sends file ${message.content.name}`,
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
      new FileReceiverPeerConnection(message.roomId, message.connId, message.opponentWsId, this.wsHandler, this.store, message.content.size, this.sub);
    }
  }

  private updateCallTransfer(m: ChangeP2pRoomInfoMessage) {
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

  private async updateMessagesTransfer(m: ChangeP2pRoomInfoMessage) {
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
