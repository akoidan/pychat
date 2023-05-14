import {MessageStatus} from "@common/model/enum/message.status";
import type {SendSetMessagesStatusMessage} from "@/ts/types/messages/inner/send.set.messages.status";
import {
  SyncP2PMessageBody,
} from "@/ts/types/messages/inner/sync.p2p";
import type {
  SyncP2PInnerSystemMessage,
} from "@/ts/types/messages/inner/sync.p2p";
import AbstractPeerConnection from "@/ts/webrtc/AbstractPeerConnection";
import type WsApi from "@/ts/message_handlers/WsApi";
import type {DefaultStore} from "@/ts/classes/DefaultStore";

import type {MessageModel, RoomModel} from "@/ts/types/model";
import {MessageStatusInner} from "@/ts/types/model";
import type {MessageP2pDto, MessagesInfo} from "@/ts/types/messages/p2pDto";
import {messageModelToP2p, p2pMessageToModel} from "@/ts/types/converters";

import type {MessageHelper} from "@/ts/message_handlers/MessageHelper";
import loggerFactory from "@/ts/instances/loggerFactory";
import type Subscription from "@/ts/classes/Subscription";
import {
  P2PSubscribe,
  Subscribe,
} from "@/ts/utils/pubsub";
import type {SetMessageStatusWsInMessage} from "@common/ws/message/set.message.status";
import {SetMessageStatusWsInBody} from "@common/ws/message/set.message.status";
import type {CheckDestroyInnerSystemMessage} from "@/ts/types/messages/peer-connection/accept.file.reply";
import {SendSetMessagesStatusMessageBody} from "@/ts/types/messages/inner/send.set.messages.status";
import type {
  SendSetMessagesStatusInnerSystemMessage,
} from "@/ts/types/messages/inner/send.set.message.status";
import {
  SendSetMessagesStatusInnerSystemBody,
} from "@/ts/types/messages/inner/send.set.message.status";
import {SetMessageStatusP2pMessage} from "@/ts/types/messages/p2p/set.message.status";
import type {
  ExchangeMessageInfo1RequestP2pMessage,
} from "@/ts/types/messages/p2p/exchange.message.info";
import {
  ExchangeMessageInfo1RequestP2pBody,
} from "@/ts/types/messages/p2p/exchange.message.info";
import AbstractMessageProcessor from "@/ts/message_handlers/AbstractMessageProcessor";
import type {DefaultP2pMessage} from "@/ts/types/messages/p2p";
import type {
  RequestWsOutMessage,
  ResponseWsInMessage,
} from "@common/ws/common";
import {
  ExchangeMessageInfoResponse,
  ExchangeMessageInfoResponse2,
  ExchangeMessageInfoResponse3,
  SendNewP2PMessage
} from "@/ts/types/messages/p2pMessages";


export default abstract class MessagePeerConnection extends AbstractPeerConnection {
  connectedToRemote: boolean = true;

  protected readonly callBacks: Record<number, {resolve: Function; reject: Function; all?: true}> = {};

  protected readonly handlers: HandlerTypes<keyof MessagePeerConnection, "peerConnection:*"> = {
    syncP2pMessage: <HandlerType<"syncP2pMessage", "peerConnection:*">> this.syncP2pMessage,
    sendSetMessagesStatus: <HandlerType<"sendSetMessagesStatus", "peerConnection:*">> this.sendSetMessagesStatus,
  };

  protected status: "inited" | "not_inited" = "not_inited";

  private readonly messageProc: P2PMessageProcessor;

  private readonly opponentUserId: number;

  private readonly messageHelper: MessageHelper;

  private syncMessageLock: boolean = false;

  public constructor(
    roomId: number,
    connId: string,
    opponentWsId: string,
    wsHandler: WsApi,
    store: DefaultStore,
    userId: number,
    messageHelper: MessageHelper,
    sub: Subscription,
  ) {
    super(roomId, connId, opponentWsId, wsHandler, store, sub);
    this.opponentUserId = userId;
    this.logger = loggerFactory.getLoggerColor(`peer:${this.connectionId}:${this.opponentWsId}`, "#4c002b");
    this.messageProc = new P2PMessageProcessor(this, store, `peer:${connId}:${opponentWsId}`);
    this.messageHelper = messageHelper;
  }

  get isConnectedToMyAnotherDevices(): boolean {
    return this.opponentUserId === this.store.myId;
  }


  private get messages(): MessageModel[] {
    return Object.values(this.room.messages);
  }

  private get room(): RoomModel {
    return this.store.roomsDict[this.roomId];
  }

  @Subscribe<SendSetMessagesStatusInnerSystemMessage>()
  public async sendSetMessagesStatus(payload: SendSetMessagesStatusInnerSystemBody) {
    await this.messageProc.sendToServerAndAwait<SetMessageStatusP2pMessage, any>({
      action: "setMessageStatus",
      data: {
        messagesIds: payload.messageIds,
        status: MessageStatus.READ,
      },
    });
    this.store.setMessagesStatus({
      roomId: this.roomId,
      status: MessageStatus.READ,
      messagesIds: payload.messageIds,
    });
  }

  @P2PSubscribe<SetMessageStatusP2pMessage>()
  public async setMessageStatus(m: SetMessageStatusP2pMessage) {
    this.store.setMessagesStatus({
      roomId: this.roomId,
      status: m.data.status,
      messagesIds: m.data.messagesIds,
    });
  }

  public getOpponentUserId() {
    return this.opponentUserId;
  }

  abstract makeConnection(): void;

  public oniceconnectionstatechange() {
    this.logger.log(`iceconnectionstate has been changed to ${this.pc!.iceConnectionState}`);
    if (this.pc!.iceConnectionState === "disconnected" ||
      this.pc!.iceConnectionState === "failed" ||
      this.pc!.iceConnectionState === "closed") {
      this.logger.error("Connection has changed to state {}", this.pc!.iceConnectionState)();
      // TODO do we need to close?
    } else {
      this.logger.debug("ice connection -> ", this.pc!.iceConnectionState)();
    }
  }

  public async sendNewP2PMessage(payload: SendNewP2PMessage) {
    const message: MessageModel = p2pMessageToModel(payload.message, this.roomId);
    this.messageHelper.processUnknownP2pMessage(message);

    const response: ConfirmReceivedP2pMessage = {
      action: "confirmReceivedP2pMessage",
      resolveCbId: payload.cbId,
    };
    if (payload.message.userId !== this.store.myId) {
      const isRead = this.store.isCurrentWindowActive && this.store.activeRoomId === this.roomId;
      if (isRead) {
        response.status = MessageStatus.READ;
      }
    }
    this.messageProc.sendToServer(response);
  }

  @Subscribe<SyncP2PInnerSystemMessage>()
  public async syncP2pMessage(payload: SyncP2PMessageBody) {
    if (this.isChannelOpened) {
      this.logger.debug("Syncing message {}", payload.id)();
      const message: SendNewP2PMessage = {
        message: messageModelToP2p(this.room.messages[payload.id]),
        action: "sendNewP2PMessage",
      };
      const response: ConfirmReceivedP2pMessage = await this.messageProc.sendToServerAndAwait(message);
      if (!this.isConnectedToMyAnotherDevices) {
        if (response.status) {
          this.store.setMessagesStatus({
            roomId: this.roomId,
            status: response.status,
            messagesIds: [payload.id],
          });
        } else {
          this.store.markMessageAsSent({
            messagesId: [payload.id],
            roomId: this.roomId,
          });
        }
      }
    }
  }

  @Subscribe<CheckDestroyInnerSystemMessage>()
  public checkDestroy() {

    /*
     * Destroy only if user has left this room, if he's offline but connections is stil in progress,
     *  maybe he has jost connection to server but not to us
     */
    if (!this.room || !this.room.p2p) {
      this.unsubscribeAndRemoveFromParent();
    } else if (!this.room.users.includes(this.opponentUserId)) {
      this.unsubscribeAndRemoveFromParent();
    }
  }

  @P2PSubscribe<ExchangeMessageInfo1RequestP2pMessage>()
  public async exchangeMessageInfo(payload: ExchangeMessageInfo1RequestP2pBody) {
    if (this.syncMessageLock) {
      this.logger.error("oops we already acquired lock, going to syncanyway");
    }
    this.logger.debug("Processing exchangeMessageInfoRequest")();
    try {
      this.syncMessageLock = true;

      const missingIdsFromRemote: number[] = [];
      const responseMessages: MessageP2pDto[] = [];

      this.messages.forEach((message) => {
        const opponentEditedCount: number = payload.messagesInfo[message.id] ?? 0;
        if (payload.messagesInfo[message.id] !== undefined) {
          const myEditedCount: number = message.edited;
          if (myEditedCount > opponentEditedCount) {
            responseMessages.push(messageModelToP2p(message));
          } else if (myEditedCount < opponentEditedCount) {
            missingIdsFromRemote.push(message.id);
          } // Else message are synced
        } else {
          responseMessages.push(messageModelToP2p(message));
        }
      });
      Object.keys(payload.messagesInfo).forEach((remoteMId) => {
        if (!this.room.messages[remoteMId as unknown as number]) { // Convertion is automatic for js
          missingIdsFromRemote.push(parseInt(remoteMId));
        }
      });
      const response: ExchangeMessageInfoResponse = {
        action: "exchangeMessageInfoResponse",
        resolveCbId: payload.cbId,
        messages: responseMessages,
        requestMessages: missingIdsFromRemote,
      };
      const a: ExchangeMessageInfoResponse2 = await this.messageProc.sendToServerAndAwait(response);
      // Got exchangeMessageInfoResponse2
      this.saveMessagesDtoToStore(a.messages);
      this.markAsReadSentMessages(responseMessages);
      const confirmationThatReceived: ExchangeMessageInfoResponse3 = {
        action: "exchangeMessageInfoResponse3",
        resolveCbId: a.cbId,
      };
      this.messageProc.sendToServer<>(confirmationThatReceived);
    } finally {
      this.syncMessageLock = false;
    }
  }

  public async syncMessages() {
    if (this.syncMessageLock) {
      this.logger.warn("Exiting from sync message because, the lock is already acquired")();
      return;
    }
    try {
      this.syncMessageLock = true;
      await this.startMessageInfoExchange();
    } catch (e) {
      this.logger.error("Can't send messages because {}", e)();
    } finally {
      this.syncMessageLock = false;
    }
  }

  public unsubscribeAndRemoveFromParent() {
    super.unsubscribeAndRemoveFromParent();
    this.messageProc.onDropConnection("data channel lost");
  }

  public resolveCBifItsThere(data: DefaultP2pMessage<string>): boolean {

  }

  public async sendToServerAndAwaitData<REQ extends RequestWsOutMessage<any, any>, RES extends ResponseWsInMessage<any>>(message: Omit<REQ, "cbId">): Promise<RES> {
    return new Promise((resolve, reject) => {
      (message as any).cbId = ++this.uniquePositiveMessageId;
      const jsonMessage = this.getJsonMessage(message);
      this.callBacks[(message as any).cbId!] = {
        resolve,
        reject,
        all: true,
      };
      const isSent = this.sendRawTextToServer(jsonMessage);
      if (isSent) {
        this.logData(this.loggerOut, jsonMessage, message)();
      }
    });
  }


  protected onChannelMessage(event: MessageEvent) {
    const data = this.messageProc.parseMessage(event.data);
    if (!data) {
      throw Error("WTF");
    }
    if (data.resolveCbId) {
      this.callBacks[data.resolveCbId].resolve(data);
      delete this.callBacks[data.resolveCbId];
    } else if (data.action) {
      const handler = this.__p2p_handlers[data.action];
      if (handler) {
        handler.bind(this)(data);
      } else {
        throw Error(`Invalid handler ${handler} for message ${event.data}`);
      }
    } else {
      throw Error(`Invalid message ${event.data}`);
    }
  }

  private async startMessageInfoExchange() {
    if (this.isChannelOpened) {
      const mI: MessagesInfo = this.messages.reduce<MessagesInfo>((p, c) => {
        p[c.id] = c.edited ?? 0; // (undefied|null) ?? 0 === 0
        return p;
      }, {});
      const response: ExchangeMessageInfoResponse = await this.messageProc.sendToServerAndAwait<ExchangeMessageInfo1RequestP2pMessage, >({
        action: "exchangeMessageInfoRequest",
        data: {
          messagesInfo: mI,
        },
      });
      // Got exchangeMessageInfoResponse
      this.saveMessagesDtoToStore(response.messages);
      const responseMessages: MessageP2pDto[] = response.requestMessages.map(
        (id) => messageModelToP2p(this.room.messages[id]),
      );
      const responseToRequest: ExchangeMessageInfoResponse2 = {
        resolveCbId: response.cbId,
        messages: responseMessages, // We need to resolve callback even if messages are empty
        action: "exchangeMessageInfoResponse2",
      };
      await this.messageProc.sendToServerAndAwait(responseToRequest);
      this.markAsReadSentMessages(responseMessages);
    } else {
      throw Error("No connection");
    }
  }

  private markAsReadSentMessages(responseMessages: MessageP2pDto[]) {
    if (!this.isConnectedToMyAnotherDevices) {
      const isNotRead: number[] = responseMessages.map((m) => m.id).filter((id) => this.room.messages[id].status === MessageStatusInner.SENDING);
      if (isNotRead.length > 0) {
        this.store.markMessageAsSent({
          messagesId: isNotRead,
          roomId: this.roomId,
        });
      }
    }
  }

  private saveMessagesDtoToStore(messageP2pDtos: MessageP2pDto[]) {
    const messageModels: MessageModel[] = messageP2pDtos.map((rp) => p2pMessageToModel(rp, this.roomId));
    if (messageModels.length > 0) {
      this.store.addMessages({
        messages: messageModels,
        roomId: this.roomId,
      });
    }
  }
}
