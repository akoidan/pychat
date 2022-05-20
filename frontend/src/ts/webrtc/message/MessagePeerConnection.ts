import {FaceBookSignInRequest, FacebookSignInResponse} from "@common/http/auth/facebook.sign.in";
import {GoogleSignInRequest, GoogleSignInResponse} from "@common/http/auth/google.sign.in";
import {SignInRequest, SignInResponse} from "@common/http/auth/sign.in";
import {SignUpRequest, SignUpResponse} from "@common/http/auth/sign.up";
import {ValidateUserRequest, ValidateUserResponse} from "@common/http/auth/validate.user";
import {ValidateEmailResponse, ValidateUserEmailRequest} from "@common/http/auth/validte.email";
import {SaveFileRequest, SaveFileResponse} from "@common/http/file/save.file";
import {AcceptTokenRequest, AcceptTokenResponse} from "@common/http/verify/accept.token";
import {ConfirmEmailRequest, ConfirmEmailResponse} from "@common/http/verify/confirm.email";
import {SendRestorePasswordRequest, SendRestorePasswordResponse} from "@common/http/verify/send.restore.password";
import {VerifyTokenRequest, VerifyTokenResponse} from "@common/http/verify/verify.token";
import {ChannelDto} from "@common/model/dto/channel.dto";
import {FileModelDto} from "@common/model/dto/file.model.dto";
import {GiphyDto} from "@common/model/dto/giphy.dto";
import {LocationDto} from "@common/model/dto/location.dto";
import {MessageModelDto} from "@common/model/dto/message.model.dto";
import {RoomDto, RoomNoUsersDto} from "@common/model/dto/room.dto";
import {UserDto} from "@common/model/dto/user.dto";
import {UserProfileDto, UserProfileDtoWoImage} from "@common/model/dto/user.profile.dto";
import {UserSettingsDto} from "@common/model/dto/user.settings.dto";
import {Gender} from "@common/model/enum/gender";
import {ImageType} from "@common/model/enum/image.type";
import {MessageStatus} from "@common/model/enum/message.status";
import {Theme} from "@common/model/enum/theme";
import {VerificationType} from "@common/model/enum/verification.type";
import {CaptchaRequest, OauthSessionResponse, OkResponse, SessionResponse} from "@common/model/http.base";
import {BrowserBase, CallStatus, OpponentWsId, ReplyWebRtc, WebRtcDefaultMessage} from "@common/model/webrtc.base";
import {
  AddRoomBase, ChangeDeviceType, ChangeOnlineType,
  ChangeUserOnlineBase,
  MessagesResponseMessage,
  NewRoom,
  RoomExistedBefore
} from "@common/model/ws.base";
import {
  DestroyCallConnectionBody,
  DestroyCallConnectionMessage
} from "@common/ws/message/peer-connection/destroy.call.connection";
import {
  DestroyFileConnectionBody,
  DestroyFileConnectionMessage
} from "@common/ws/message/peer-connection/destroy.file.connection";
import {RetryFileMessage} from "@common/ws/message/peer-connection/retry.file";
import {SendRtcDataBody, SendRtcDataMessage} from "@common/ws/message/peer-connection/send.rtc.data";
import {AddChannelBody, AddChannelMessage} from "@common/ws/message/room/add.channel";
import {AddInviteBody, AddInviteMessage} from "@common/ws/message/room/add.invite";
import {AddOnlineUserBodyMessage, AddOnlineUserMessage} from "@common/ws/message/room/add.online.user";
import {AddRoomBody, AddRoomMessage} from "@common/ws/message/room/add.room";
import {CreateNewUsedMessage, CreateNewUserBody} from "@common/ws/message/room/create.new.user";
import {DeleteChannelBody, DeleteChannelMessage} from "@common/ws/message/room/delete.channel";
import {DeleteRoomBody, DeleteRoomMessage} from "@common/ws/message/room/delete.room";
import {InviteUserBody, InviteUserMessage} from "@common/ws/message/room/invite.user";
import {LeaveUserBody, LeaveUserMessage} from "@common/ws/message/room/leave.user";
import {RemoveOnlineUserBody, RemoveOnlineUserMessage} from "@common/ws/message/room/remove.online.user";
import {SaveChannelSettingsBody, SaveChannelSettingsMessage} from "@common/ws/message/room/save.channel.settings";
import {SaveRoomSettingsBody, SaveRoomSettingsMessage} from "@common/ws/message/room/save.room.settings";
import {
  ShowITypeWsInBody,
  ShowITypeWsInMessage,
  ShowITypeWsOutBody,
  ShowITypeWsOutMessage
} from "@common/ws/message/room/show.i.type";
import {WebRtcSetConnectionIdBody, WebRtcSetConnectionIdMessage} from "@common/ws/message/sync/set.connection.id";
import {NotifyCallActiveBody, NotifyCallActiveMessage} from "@common/ws/message/webrtc/notify.call.active";
import {OfferCallBody, OfferCallMessage} from "@common/ws/message/webrtc/offer.call";
import {OfferFileBody, OfferFileContent, OfferFileMessage} from "@common/ws/message/webrtc/offer.file";
import {OfferBody, OfferMessage} from "@common/ws/message/webrtc/offer.message";
import {AcceptCallBody, AcceptCallMessage} from "@common/ws/message/webrtc-transfer/accept.call";
import {AcceptFileBody, AcceptFileMessage} from "@common/ws/message/webrtc-transfer/accept.file";
import {ReplyCallBody, ReplyCallMessage} from "@common/ws/message/webrtc-transfer/reply.call";
import {ReplyFileBody, ReplyFileMessage} from "@common/ws/message/webrtc-transfer/reply.file";
import {PingBody, PingMessage} from "@common/ws/message/ws/ping";
import {PongBody, PongMessage} from "@common/ws/message/ws/pong";
import {SetProfileImageBody, SetProfileImageMessage} from "@common/ws/message/ws/set.profile.image";
import {SetSettingBody, SetSettingsMessage} from "@common/ws/message/ws/set.settings";
import {SetUserProfileBody, SetUserProfileMessage} from "@common/ws/message/ws/set.user.profile";
import {SetWsIdWsOutBody, SetWsIdWsOutMessage} from "@common/ws/message/ws/set.ws.id";
import {UserProfileChangedBody, UserProfileChangedMessage} from "@common/ws/message/ws/user.profile.changed";
import {DeleteMessage, DeleteMessageBody} from "@common/ws/message/ws-message/delete.message";
import {
  PrintMessageWsInMessage,
  PrintMessageWsOutBody,
  PrintMessageWsOutMessage
} from "@common/ws/message/ws-message/print.message";
import {
  GetCountryCodeWsInBody, GetCountryCodeWsInMessage,
  GetCountryCodeWsOutBody,
  GetCountryCodeWsOutMessage
} from "@common/ws/message/get.country.code";
import {GrowlWsInBody, GrowlWsInMessage} from "@common/ws/message/growl.message";
import {
  SetMessageStatusWsInBody, SetMessageStatusWsInMessage,
  SetMessageStatusWsOutBody,
  SetMessageStatusWsOutMessage
} from "@common/ws/message/set.message.status";
import {
  SyncHistoryWsInBody,
  SyncHistoryWsInMessage,
  SyncHistoryWsOutBody,
  SyncHistoryWsOutMessage
} from "@common/ws/message/sync.history";
import {
  DefaultWsInMessage,
  DefaultWsOutMessage,
  HandlerName,
  RequestWsOutMessage,
  ResponseWsInMessage
} from "@common/ws/common";
import {ALL_ROOM_ID, MAX_USERNAME_LENGTH, WS_SESSION_EXPIRED_CODE} from "@common/consts";
import {SendSetMessagesStatusMessage} from "@/ts/types/messages/inner/send.set.messages.status";
import {SyncP2PMessage} from "@/ts/types/messages/inner/sync.p2p";
import {MessageStatus} from '@common/model/enum/message.status';
import AbstractPeerConnection from "@/ts/webrtc/AbstractPeerConnection";
import type WsHandler from "@/ts/message_handlers/WsHandler";
import type {DefaultStore} from "@/ts/classes/DefaultStore";
import type {MessageSupplier} from "@/ts/types/types";
import {P2PMessageProcessor} from "@/ts/message_handlers/P2PMessageProcessor";

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
import {MessageStatusInner} from '@/ts/types/model';
import type {
  MessageP2pDto,
  MessagesInfo,
} from "@/ts/types/messages/p2pDto";
import {
  messageModelToP2p,
  p2pMessageToModel,
} from "@/ts/types/converters";

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
      status: MessageStatus.READ,
    };
    await this.messageProc.sendToServerAndAwait(responseToRequest);
    this.store.setMessagesStatus({
      roomId: this.roomId,
      status: MessageStatus.READ,
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
        response.status = MessageStatus.READ;
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
