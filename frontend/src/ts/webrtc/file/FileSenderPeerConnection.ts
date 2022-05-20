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
import type {
  AddSendingFileTransfer,
  SetSendingFileStatus,
  SetSendingFileUploaded,
} from "@/ts/types/types";
import type {SendingFileTransfer} from "@/ts/types/model";
import {FileTransferStatus} from "@/ts/types/model";
import type WsHandler from "@/ts/message_handlers/WsHandler";
import {
  bytesToSize,
  getDay,
} from "@/ts/utils/pureFunctions";
import {
  READ_CHUNK_SIZE,
  SEND_CHUNK_SIZE,
} from "@/ts/utils/consts";
import FilePeerConnection from "@/ts/webrtc/file/FilePeerConnection";
import type {DefaultStore} from "@/ts/classes/DefaultStore";
import type Subscription from "@/ts/classes/Subscription";


export default class FileSenderPeerConnection extends FilePeerConnection {
  protected readonly handlers: HandlerTypes<keyof FileSenderPeerConnection, "peerConnection:*"> = {
    destroyFileConnection: <HandlerType<"destroyFileConnection", "peerConnection:*">> this.destroyFileConnection,
    acceptFile: <HandlerType<"acceptFile", "peerConnection:*">> this.acceptFile,
    sendRtcData: <HandlerType<"sendRtcData", "peerConnection:*">> this.sendRtcData,
    declineSending: <HandlerType<"declineSending", "peerConnection:*">> this.declineSending,
  };

  private readonly file: File;

  private reader: FileReader | null = null;

  private offset: number = 0;

  private lastPrinted: number = 0;

  private sendDataTimeout: number = 0;

  private trackTimeout: number = 0;

  public constructor(roomId: number, connId: string, opponentWsId: string, wsHandler: WsHandler, store: DefaultStore, file: File, userId: number, sub: Subscription) {
    super(roomId, connId, opponentWsId, wsHandler, store, sub);
    this.file = file;
    const asft: AddSendingFileTransfer = {
      connId,
      transferId: opponentWsId,
      roomId,
      transfer: {
        status: FileTransferStatus.NOT_DECIDED_YET,
        error: null,
        userId,
        upload: {
          total: this.file.size,
          uploaded: 0,
        },
      },
    };
    this.store.addSendingFileTransfer(asft);
  }

  get sendingFileTransfer(): SendingFileTransfer {
    return this.store.roomsDict[this.roomId].sendingFiles[this.connectionId].transfers[this.opponentWsId];
  }

  public oniceconnectionstatechange() {
    super.oniceconnectionstatechange();
    if (this.pc!.iceConnectionState === "disconnected" ||
      this.pc!.iceConnectionState === "failed" ||
      this.pc!.iceConnectionState === "closed") {
      if (this.sendDataTimeout) {
        this.logger.log("clearing sendDataTimeout {}", this.sendDataTimeout)();
        window.clearTimeout(this.sendDataTimeout); // Should this be in destroy?
      }
      if (this.trackTimeout) {
        this.logger.log("clearing trackTimeout {}", this.trackTimeout)();
        window.clearTimeout(this.trackTimeout);
      }
    }
  }

  public acceptFile(message: AcceptFileMessage) {
    this.offset = message.content.received;
    this.createPeerConnection();
    const ssfs: SetSendingFileStatus = {
      status: FileTransferStatus.IN_PROGRESS,
      roomId: this.roomId,
      error: null,
      connId: this.connectionId,
      transfer: this.opponentWsId,
    };
    this.store.setSendingFileStatus(ssfs);
    this.setTranseferdAmount(message.content.received);
    try {
      // Reliable data channels not supported by Chrome
      this.sendChannel = this.pc!.createDataChannel("sendDataChannel", {reliable: false});
      this.sendChannel.onopen = this.onreceiveChannelOpen.bind(this);
      this.logger.log("Created send data channel.")();
    } catch (e: any) {
      const error = `Failed to create data channel because ${e.message || e}`;
      this.commitErrorIntoStore(error);
      this.logger.error("acceptFile {}", e)();

      return;
    }
    this.createOffer();
    this.wsHandler.retry(this.connectionId, this.opponentWsId);
  }

  public onreceiveChannelOpen() {
    this.logger.log("Channel is open, slicing file: {} {} {} {}", this.file.name, bytesToSize(this.file.size), this.file.type, getDay(new Date(this.file.lastModified)))();
    this.reader = new FileReader();
    this.reader.onload = this.onFileReaderLoad.bind(this);
    this.sendCurrentSlice();
    this.lastPrinted = 0;
  }

  public sendCurrentSlice() {
    const currentSlice = this.file.slice(this.offset, this.offset + READ_CHUNK_SIZE);
    this.reader!.readAsArrayBuffer(currentSlice);
  }

  public setTranseferdAmount(value: number) {
    const ssfu: SetSendingFileUploaded = {
      roomId: this.roomId,
      uploaded: value,
      connId: this.connectionId,
      transfer: this.opponentWsId,
    };
    this.store.setSendingFileUploaded(ssfu);
  }

  public onFileReaderLoad(e: ProgressEvent<FileReader>) {
    if ((<ArrayBuffer>e.target!.result).byteLength > 0) { // TODO if it's an str?
      this.sendData(<ArrayBuffer>e.target!.result, 0, () => {
        this.offset += (<ArrayBuffer>e.target!.result).byteLength;
        this.sendCurrentSlice();
      });
    } else {
      const trackTransfer = () => {
        this.trackTimeout = 0;
        this.logger.debug("trackTransfer")();
        if (this.sendChannel!.readyState === "open" && this.sendChannel!.bufferedAmount > 0) {
          this.setTranseferdAmount(this.offset - this.sendChannel!.bufferedAmount);
          this.trackTimeout = window.setTimeout(trackTransfer, 500);
        } else if (this.sendChannel!.bufferedAmount === 0) {
          this.setTranseferdAmount(this.offset);
        }
      };
      trackTransfer();
      this.logger.log("Exiting, offset is {} now, fs: {}", this.offset, this.file.size)();
    }
  }

  public destroyFileConnection(message: DestroyFileConnectionMessage) {
    let isError = false;
    let status;
    if (message.content === "decline") {
      status = FileTransferStatus.DECLINED_BY_OPPONENT;
      this.unsubscribeAndRemoveFromParent();
    } else if (message.content === "success") {
      status = FileTransferStatus.FINISHED;
      this.unsubscribeAndRemoveFromParent();
    } else {
      status = FileTransferStatus.ERROR;
      isError = true;
    }
    const payload: SetSendingFileStatus = {
      transfer: this.opponentWsId,
      connId: this.connectionId,
      error: isError ? message.content : null,
      roomId: this.roomId,
      status,
    };
    this.store.setSendingFileStatus(payload);
  }

  public declineSending() {
    this.unsubscribeAndRemoveFromParent();
    const ssfs: SetSendingFileStatus = {
      status: FileTransferStatus.DECLINED_BY_YOU,
      roomId: this.roomId,
      error: null,
      connId: this.connectionId,
      transfer: this.opponentWsId,
    };
    this.store.setSendingFileStatus(ssfs);
    this.wsHandler.destroyPeerFileConnection(this.connectionId, "decline", this.opponentWsId);
  }

  commitErrorIntoStore(error: string, onlyIfNotFinished: boolean = false): void {
    if (onlyIfNotFinished && this.sendingFileTransfer.status === FileTransferStatus.FINISHED) {
      return;
    }
    const ssfs: SetSendingFileStatus = {
      status: FileTransferStatus.ERROR,
      roomId: this.roomId,
      error,
      connId: this.connectionId,
      transfer: this.opponentWsId,
    };
    this.store.setSendingFileStatus(ssfs);
  }

  private sendData(data: ArrayBuffer, offset: number, cb: () => void): void {
    this.sendDataTimeout = 0;
    try {
      if (this.sendChannel!.readyState === "open") {
        if (this.sendChannel!.bufferedAmount > 10000000) { // Prevent chrome buffer overfill
          // If it happens chrome will just close the datachannel
          const now = Date.now();
          if (now - this.lastPrinted > 1000) {
            this.lastPrinted = now;
            this.logger.debug(
              "Buffer overflow by {}, waiting to flush...",
              bytesToSize(this.sendChannel!.bufferedAmount),
            )();
          }
          this.sendDataTimeout = setTimeout(this.sendData.bind(this), 100, data, offset, cb) as any;

          return;
        }
        const buffer = data.slice(offset, offset + SEND_CHUNK_SIZE);
        this.sendChannel!.send(buffer);
        const chunkOffset = offset + buffer.byteLength;
        this.setTranseferdAmount(this.offset + chunkOffset - this.sendChannel!.bufferedAmount);
        if (data.byteLength > chunkOffset) {
          this.sendData(data, chunkOffset, cb);
        } else {
          cb();
        }
      } else {
        throw Error(`Can't write data into ${this.sendChannel!.readyState} channel`);
      }
    } catch (error: any) {
      this.commitErrorIntoStore(`Internal error: ${error?.message}`);
      this.unsubscribeAndRemoveFromParent();
      this.logger.error("sendData {}", error)();
    }
  }
}
