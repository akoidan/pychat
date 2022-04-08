import AbstractPeerConnection from "@/ts/webrtc/AbstractPeerConnection";
import type WsHandler from "@/ts/message_handlers/WsHandler";
import type {DefaultStore} from "@/ts/classes/DefaultStore";
import type {MessageSupplier} from "@/ts/types/types";
import {P2PMessageProcessor} from "@/ts/message_handlers/P2PMessageProcessor";

import type {
  HandlerType,
  HandlerTypes,
} from "@/ts/types/messages/baseMessagesInterfaces";
import type {
  ConfirmReceivedP2pMessage,
  ConfirmSetMessageStatusRequest,
  DefaultP2pMessage,
  ExchangeMessageInfoRequest,
  ExchangeMessageInfoResponse,
  ExchangeMessageInfoResponse2,
  ExchangeMessageInfoResponse3,
  P2PHandlerType,
  P2PHandlerTypes,
  SendNewP2PMessage,
  SetMessageStatusRequest,
} from "@/ts/types/messages/p2pMessages";
import type {
  MessageModel,
  RoomModel,
} from "@/ts/types/model";
import type {
  MessageP2pDto,
  MessagesInfo,
} from "@/ts/types/messages/p2pDto";
import {
  messageModelToP2p,
  p2pMessageToModel,
} from "@/ts/types/converters";
import type {
  SendSetMessagesStatusMessage,
  SyncP2PMessage,
} from "@/ts/types/messages/innerMessages";
import type {MessageHelper} from "@/ts/message_handlers/MessageHelper";
import loggerFactory from "@/ts/instances/loggerFactory";
import type Subscription from "@/ts/classes/Subscription";

export default abstract class MessagePeerConnection extends AbstractPeerConnection implements MessageSupplier {
  connectedToRemote: boolean = true;

  protected readonly handlers: HandlerTypes<keyof MessagePeerConnection, "peerConnection:*"> = {
    sendRtcData: <HandlerType<"sendRtcData", "peerConnection:*">> this.sendRtcData,
    checkDestroy: <HandlerType<"checkDestroy", "peerConnection:*">> this.checkDestroy,
    syncP2pMessage: <HandlerType<"syncP2pMessage", "peerConnection:*">> this.syncP2pMessage,
    sendSetMessagesStatus: <HandlerType<"sendSetMessagesStatus", "peerConnection:*">> this.sendSetMessagesStatus,
  };

  protected status: "inited" | "not_inited" = "not_inited";

  private readonly p2pHandlers: P2PHandlerTypes<keyof MessagePeerConnection> = {
    exchangeMessageInfoRequest: <P2PHandlerType<"exchangeMessageInfoRequest">> this.exchangeMessageInfoRequest,
    sendNewP2PMessage: <P2PHandlerType<"sendNewP2PMessage">> this.sendNewP2PMessage,
    setMessageStatus: <P2PHandlerType<"setMessageStatus">> this.setMessageStatus,
  };

  private readonly messageProc: P2PMessageProcessor;

  private readonly opponentUserId: number;

  private readonly messageHelper: MessageHelper;

  private syncMessageLock: boolean = false;

  public constructor(
    roomId: number,
    connId: string,
    opponentWsId: string,
    wsHandler: WsHandler,
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

  private get isChannelOpened(): boolean {
    return this.sendChannel?.readyState === "open";
  }

  private get messages(): MessageModel[] {
    return Object.values(this.room.messages);
  }

  private get room(): RoomModel {
    return this.store.roomsDict[this.roomId];
  }

  public async sendSetMessagesStatus(payload: SendSetMessagesStatusMessage) {
    const responseToRequest: SetMessageStatusRequest = {
      action: "setMessageStatus",
      messagesIds: payload.messageIds,
      status: "read",
    };
    await this.messageProc.sendToServerAndAwait(responseToRequest);
    this.store.setMessagesStatus({
      roomId: this.roomId,
      status: "read",
      messagesIds: payload.messageIds,
    });
  }

  public async setMessageStatus(m: SetMessageStatusRequest) {
    this.store.setMessagesStatus({
      roomId: this.roomId,
      status: m.status,
      messagesIds: m.messagesIds,
    });
    const response: ConfirmSetMessageStatusRequest = {
      action: "confirmSetMessageStatusRequest",
      resolveCbId: m.cbId,
    };
    this.messageProc.sendToServer(response);
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
        response.status = "read";
      }
    }
    this.messageProc.sendToServer(response);
  }

  public async syncP2pMessage(payload: SyncP2PMessage) {
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

  public async exchangeMessageInfoRequest(payload: ExchangeMessageInfoRequest) {
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
      this.messageProc.sendToServer(confirmationThatReceived);
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
      await this.exchangeMessageInfo();
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

  public getWsConnectionId(): string {
    return this.wsHandler.getWsConnectionId();
  }

  public sendRawTextToServer(message: string): boolean {
    if (this.isChannelOpened) {
      this.sendChannel!.send(message);
      return true;
    }
    return false;
  }

  protected setupEvents() {
    this.sendChannel!.onmessage = this.onChannelMessage.bind(this);
    this.sendChannel!.onopen = () => {
      this.logger.log("Channel opened")();
      if (this.getWsConnectionId() > this.opponentWsId) {
        this.syncMessages();
      }
      this.store.addLiveConnectionToRoom({
        connection: this.opponentWsId,
        roomId: this.roomId,
      });
    };
    this.sendChannel!.onclose = () => {
      this.logger.log("Closed channel ")();
      // This.syncMessageLock = false; // just for the case, not nessesary
      this.messageProc.onDropConnection("Data channel closed");
      if (this.store.userInfo) {
        // Otherwise we logged out
        this.store.removeLiveConnectionToRoom({
          connection: this.opponentWsId,
          roomId: this.roomId,
        });
      }
    };
  }

  protected onChannelMessage(event: MessageEvent) {
    const data: DefaultP2pMessage<keyof MessagePeerConnection> = this.messageProc.parseMessage(event.data) as unknown as DefaultP2pMessage<keyof MessagePeerConnection>;
    if (data) {
      const cb = this.messageProc.resolveCBifItsThere(data);
      if (!cb) {
        const handler: P2PHandlerType<keyof MessagePeerConnection> = this.p2pHandlers[data.action] as P2PHandlerType<keyof MessagePeerConnection>;
        if (handler) {
          handler.bind(this)(data);
        } else {
          this.logger.error("{} can't find handler for {}, available handlers {}. Message: {}", this.constructor.name, data.action, Object.keys(this.p2pHandlers), data)();
        }
      }
    }
  }

  private async exchangeMessageInfo() {
    if (this.isChannelOpened) {
      const mI: MessagesInfo = this.messages.reduce<MessagesInfo>((p, c) => {
        p[c.id] = c.edited ?? 0; // (undefied|null) ?? 0 === 0
        return p;
      }, {});
      const message: ExchangeMessageInfoRequest = {
        action: "exchangeMessageInfoRequest",
        messagesInfo: mI,
      };
      const response: ExchangeMessageInfoResponse = await this.messageProc.sendToServerAndAwait(message);
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
      const isNotRead: number[] = responseMessages.map((m) => m.id).filter((id) => this.room.messages[id].status === "sending");
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
