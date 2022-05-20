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
import BaseTransferHandler from "@/ts/webrtc/BaseTransferHandler";
import type {
  MessageSender,
  UserIdConn,
} from "@/ts/types/types";
import type {RoomModel} from "@/ts/types/model";
import MessageSenderPeerConnection from "@/ts/webrtc/message/MessageSenderPeerConnection";
import MessageReceiverPeerConnection from "@/ts/webrtc/message/MessageReceiverPeerConnection";
import type WsHandler from "@/ts/message_handlers/WsHandler";
import type NotifierHandler from "@/ts/classes/NotificationHandler";
import type {DefaultStore} from "@/ts/classes/DefaultStore";
import Subscription from "@/ts/classes/Subscription";


import type {MessageHelper} from "@/ts/message_handlers/MessageHelper";


/**
 *
 * https://drive.google.com/file/d/1BCtFNNWprfobqQlG4n2lPyWEqroi7nJh/view
 */
export default class MessageTransferHandler extends BaseTransferHandler implements MessageSender {
  protected readonly handlers: HandlerTypes<keyof MessageTransferHandler, "webrtc-message"> = {};

  private state: "initing" | "not_inited" | "ready" = "not_inited";

  private readonly messageHelper: MessageHelper;

  public constructor(roomId: number, wsHandler: WsHandler, notifier: NotifierHandler, store: DefaultStore, messageHelper: MessageHelper, sub: Subscription) {
    super(roomId, wsHandler, notifier, store, sub);
    this.messageHelper = messageHelper;
  }

  private get room(): RoomModel {
    return this.store.roomsDict[this.roomId];
  }

  private get connectionIds(): UserIdConn[] {
    if (!this.room) {
      return [];
    }
    const usersIds = this.room.users;
    const myConnectionId = this.wsHandler.getWsConnectionId();
    const connections = usersIds.reduce<UserIdConn[]>((connectionIdsWithUser, userId) => {
      const connectionIds: string[] = this.store.onlineDict[userId] ?? [];
      connectionIds.forEach((connectionId) => {
        if (connectionId !== myConnectionId) {
          connectionIdsWithUser.push({
            userId,
            connectionId,
          });
        }
      });
      return connectionIdsWithUser;
    }, []);
    this.logger.debug("Evaluated {} connectionIds", connections)();
    return connections;
  }

  async syncMessage(roomId: number, messageId: number): Promise<void> {
    this.messageHelper.processAnyMessage();
    if (this.state === "ready") {
      const payload: SyncP2PMessage = {
        action: "syncP2pMessage",
        handler: Subscription.allPeerConnectionsForTransfer(this.connectionId!),
        id: messageId,
        allowZeroSubscribers: true,
      };
      this.sub.notify(payload);
    }
  }

  public destroyThisTransferHandler() {
    this.sub.notify({
      action: "checkDestroy",
      handler: Subscription.allPeerConnectionsForTransfer(this.connectionId!),
    });
  }

  public async init() {
    if (this.state === "not_inited") {
      this.state = "initing";
      try {
        const {connId} = await this.wsHandler.offerMessageConnection(this.roomId);
        if (!connId) {
          throw Error("Error during setting connection ID");
        }
        // @ts-expect-error: next-line
        if (this.state !== "ready") { // Already inited in another place, like in accept connection
          this.setConnectionId(connId);
          this.state = "ready";
          await this.refreshPeerConnections();
        }
      } catch (e) {
        this.state = "not_inited";
      }
    }
  }

  public async initOrSync() {
    // If state is initing, refresh connection will be triggered when it finishes
    if (this.state === "not_inited") { // If it's not inited , refresh connection wil trigger inside this init()
      await this.init();
    } else if (this.state === "ready") { // If it's ready, we should check if new devices appeard while we were offline
      this.refreshPeerConnections();
    }
  }

  public async acceptConnection({connId}: {connId: string}) {

    /*
     * If connection is initing, we make it ready, so init would not refresh connection again
     * if connection is not_inited, this assignments initializes it.
     * if connection is ready already, we should refresh the connection to create a new PeerConnection for opponent device
     */
    this.setConnectionId(connId);
    this.state = "ready";
    // This means user probably appears online, we should refresh connections
    this.refreshPeerConnections();
  }

  public refreshPeerConnections() {
    const myConnectionId = this.wsHandler.getWsConnectionId();
    const newConnectionIdsWithUser = this.connectionIds;
    newConnectionIdsWithUser.forEach((connectionIdWithUser) => {
      const opponentWsId = connectionIdWithUser.connectionId;
      if (this.sub.getNumberOfSubscribers(Subscription.getPeerConnectionId(this.connectionId!, opponentWsId)) == 0) {
        let mpc;
        if (opponentWsId > myConnectionId) {
          mpc = new MessageSenderPeerConnection(
            this.roomId,
            this.connectionId!,
            opponentWsId,
            this.wsHandler,
            this.store,
            connectionIdWithUser.userId,
            this.messageHelper,
            this.sub,
          );
        } else {
          mpc = new MessageReceiverPeerConnection(
            this.roomId,
            this.connectionId!,
            opponentWsId,
            this.wsHandler,
            this.store,
            connectionIdWithUser.userId,
            this.messageHelper,
            this.sub,
          );
        }
        mpc.makeConnection();
      }
    });
    // Let newConnectionIds: string[] = newConnectionIdsWithUser.map(a => a.connectionId);

    // Let connectionsToRemove = this.webrtcConnnectionsIds.filter(oldC => newConnectionIds.indexOf(oldC) < 0);
    this.sub.notify({
      action: "checkDestroy",
      handler: Subscription.allPeerConnectionsForTransfer(this.connectionId!),
      allowZeroSubscribers: true,
    });
  }

  async loadThreadMessages(roomId: number, threadId: number): Promise<void> {
    this.logger.error("Method not implemented.")();
    return Promise.resolve();

    /*
     * This.store.growlError('The operation you\'re trying to do is not supported on p2p channel yet');
     * throw new Error('Method not implemented.');
     */
  }

  async loadUpSearchMessages(roomId: number, count: number): Promise<void> {
    throw new Error("Searching message is not supported on p2p direct channel yet");
  }

  public async markMessagesInCurrentRoomAsRead(roomId: number, messageIds: number[]) {
    this.messageHelper.processAnyMessage();
    if (this.state === "ready") {
      const payload: SendSetMessagesStatusMessage = {
        action: "sendSetMessagesStatus",
        handler: Subscription.allPeerConnectionsForTransfer(this.connectionId!),
        messageIds,
        status: MessageStatus.READ,
        allowZeroSubscribers: true,
      };
      this.sub.notify(payload);
    }
  }

  async loadMessages(roomId: number, messageId: number[]): Promise<void> {
    this.logger.error("Method not implemented.")();
    return Promise.resolve();
  }

  async loadUpMessages(roomId: number, count: number): Promise<void> {
    this.logger.error("Method not implemented.")();
    return Promise.resolve();
  }
}
