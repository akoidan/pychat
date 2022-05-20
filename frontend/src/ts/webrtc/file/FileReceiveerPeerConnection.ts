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
  SetReceivingFileStatus,
  SetReceivingFileUploaded,
} from "@/ts/types/types";
import type {ReceivingFile} from "@/ts/types/model";
import {FileTransferStatus} from "@/ts/types/model";
import {bytesToSize} from "@/ts/utils/pureFunctions";
import type WsHandler from "@/ts/message_handlers/WsHandler";
import {requestFileSystem} from "@/ts/utils/htmlApi";
import {
  MAX_ACCEPT_FILE_SIZE_WO_FS_API,
  MAX_BUFFER_SIZE,
} from "@/ts/utils/consts";
import FilePeerConnection from "@/ts/webrtc/file/FilePeerConnection";
import type {DefaultStore} from "@/ts/classes/DefaultStore";
import type Subscription from "@/ts/classes/Subscription";


export default class FileReceiverPeerConnection extends FilePeerConnection {
  protected readonly handlers: HandlerTypes<keyof FileReceiverPeerConnection, "peerConnection:*"> = {
    sendRtcData: <HandlerType<"sendRtcData", "peerConnection:*">> this.sendRtcData,
    retryFile: <HandlerType<"retryFile", "peerConnection:*">> this.retryFile,
    retryFileReply: <HandlerType<"retryFileReply", "peerConnection:*">> this.retryFileReply,
    acceptFileReply: <HandlerType<"acceptFileReply", "peerConnection:*">> this.acceptFileReply,
    declineFileReply: <HandlerType<"declineFileReply", "peerConnection:*">> this.declineFileReply,
    destroyFileConnection: <HandlerType<"destroyFileConnection", "peerConnection:*">> this.destroyFileConnection,
  };

  private readonly fileSize: number;

  private fileEntry: FileEntry | null = null;

  private fileWriter: FileWriter | null = null;

  private readonly blobsQueue: Blob[] = [];

  private receiveBuffer: BlobPart[] = [];

  private receivedSize = 0;

  private recevedUsingFile = false;

  private retryFileSend: number = 0;

  public constructor(roomId: number, connId: string, opponentWsId: string, wsHandler: WsHandler, store: DefaultStore, size: number, sub: Subscription) {
    super(roomId, connId, opponentWsId, wsHandler, store, sub);
    this.fileSize = size;
  }

  get receivingFile(): ReceivingFile {
    return this.store.roomsDict[this.roomId].receivingFiles[this.connectionId];
  }

  public retryFileReply() {
    const now = Date.now();
    if (now - this.retryFileSend > 5000) {
      this.retryFileSend = now;
      this.waitForAnswer();
    }
  }

  public declineFileReply() {
    this.wsHandler.destroyFileConnection(this.connectionId, "decline");
    const rf: SetReceivingFileStatus = {
      roomId: this.roomId,
      connId: this.connectionId,
      status: FileTransferStatus.DECLINED_BY_YOU,
    };
    this.store.setReceivingFileStatus(rf);
    this.unsubscribeAndRemoveFromParent();
  }

  public async acceptFileReply() {
    try {
      await this.initFileSystemApi();
    } catch (e) {
      this.logger.error("Error initing fs {}", e);
      if (this.fileSize > MAX_ACCEPT_FILE_SIZE_WO_FS_API) {
        const content = `Browser doesn't support accepting file sizes over ${bytesToSize(MAX_ACCEPT_FILE_SIZE_WO_FS_API)}`;
        this.wsHandler.destroyFileConnection(this.connectionId, content);
        this.commitErrorIntoStore(content);
        this.unsubscribeAndRemoveFromParent();
        throw e;
      }
    }
    this.commitErrorIntoStore("Establishing connection...");
    this.waitForAnswer();
  }

  public destroyFileConnection(message: DestroyFileConnectionMessage) {
    const payload: SetReceivingFileStatus = {
      error: null,
      status: FileTransferStatus.DECLINED_BY_OPPONENT,
      connId: this.connectionId,
      roomId: this.roomId,
    };
    this.store.setReceivingFileStatus(payload);
    this.unsubscribeAndRemoveFromParent();
  }

  public retryFile(message: RetryFileMessage) {
    const payload: SetReceivingFileStatus = {
      error: null,
      status: FileTransferStatus.IN_PROGRESS,
      connId: this.connectionId,
      roomId: this.roomId,
    };
    this.store.setReceivingFileStatus(payload);
  }

  commitErrorIntoStore(error: string, onlyIfNotFinished: boolean = false): void {
    if (onlyIfNotFinished && this.receivingFile.status === FileTransferStatus.FINISHED) {
      return;
    }
    const ssfs: SetReceivingFileStatus = {
      status: FileTransferStatus.ERROR,
      roomId: this.roomId,
      error,
      connId: this.connectionId,
    };
    this.store.setReceivingFileStatus(ssfs);
  }

  protected onChannelMessage(event: MessageEvent) {
    this.receiveBuffer.push(event.data);
    // Chrome accepts bufferArray (.byteLength). firefox accepts blob (.size)
    const receivedSize = event.data.byteLength ? event.data.byteLength : event.data.size;
    this.receivedSize += receivedSize;
    this.syncBufferWithFs();
    const payload: SetReceivingFileUploaded = {
      connId: this.connectionId,
      roomId: this.roomId,
      uploaded: this.receivedSize,
    };
    this.store.setReceivingFileUploaded(payload);
    this.assembleFileIfDone();
  }

  private async initFileSystemApi() {
    this.logger.debug("Creating temp location {}", bytesToSize(this.fileSize))();
    if (!requestFileSystem) {
      throw Error("Request FS is not available");
    }
    const fs: FileSystem | null = null;
    try {
      const fs: FileSystem = await new Promise<FileSystem>((resolve, reject) => {
        requestFileSystem(
          window.TEMPORARY,
          this.fileSize,
          resolve,
          reject,
        );
      });
      this.fileEntry = await new Promise<FileEntry>((resolve, reject) => {
        fs.root.getFile(this.connectionId, {create: true}, resolve as any, reject);
      }, // TODO as?
      );
      this.fileWriter = await new Promise<FileWriter>((resolve, reject) => {
        this.fileEntry!.createWriter(resolve, reject);
      });

      if (!this.fileWriter.WRITING) {
        this.fileWriter.WRITING = 1;
      }
      this.fileWriter.onwriteend = this.onWriteEnd.bind(this);
      this.logger.log("FileWriter is created")();
    } catch (e: any) {
      this.logger.error("FileSystemApi Error: {}, code {}", e.message || e, e.code)();
      if (fs && e.code === 22) { // TODO move this to specific entry so we can recreate file
        await this.clearFS(fs);
      } else {
        this.store.growlError(`FileSystemApi Error: ${e.message}` || e.code || e);
      }
      throw e;
    }
  }

  private syncBufferWithFs() {
    if (this.fileWriter && (this.receiveBuffer.length > MAX_BUFFER_SIZE || this.isDone())) {
      this.recevedUsingFile = true;
      const blob = new Blob(this.receiveBuffer);
      this.receiveBuffer = [];
      if (this.fileWriter.readyState === this.fileWriter.WRITING) {
        this.blobsQueue.push(blob);
      } else {
        this.fileWriter.write(blob);
      }
    }
  }

  private onWriteEnd() {
    if (this.blobsQueue.length > 0) {
      this.fileWriter!.write(this.blobsQueue.shift()!);
    } else {
      this.assembleFileIfDone();
    }
  }

  private isDone() {
    return this.receivedSize === this.fileSize;
  }

  private assembleFileIfDone() {
    if (this.isDone()) {
      const received = this.recevedUsingFile ? this.fileEntry!.toURL() : URL.createObjectURL(new window.Blob(this.receiveBuffer));
      this.logger.log("File is received")();
      this.wsHandler.destroyFileConnection(this.connectionId, "success");
      this.receiveBuffer = []; // Clear buffer
      this.receivedSize = 0;
      const payload: SetReceivingFileStatus = {
        anchor: received,
        error: null,
        status: FileTransferStatus.FINISHED,
        connId: this.connectionId,
        roomId: this.roomId,
      };
      this.store.setReceivingFileStatus(payload);
      this.unsubscribeAndRemoveFromParent();
    }
  }

  private async clearFS(fs: FileSystem) {
    this.logger.log("Quota exceeded, trying to clear it")();
    const entries: Entry[] = await new Promise<Entry[]>((resolve, reject) => {
      fs.root.createReader().readEntries(resolve as any, reject);
    }, // TODO as?
    );
    await Promise.all(entries.map(async(e: Entry) => {
      if (e.isFile) {
        await new Promise<void>((resolve, reject) => {
          e.remove(resolve, reject);
        });
        this.logger.log("Removed file {}", e.fullPath)();
      } else {
        await new Promise<void>((resolve, reject) => {
          (<DirectoryEntry>e).removeRecursively(resolve, reject);
        });
        this.logger.log("Removed directory {}", e.fullPath)();
      }
    }));
  }

  private gotReceiveChannel(event: RTCDataChannelEvent) {
    this.logger.debug("Received new channel")();
    this.sendChannel = event.channel;
    this.sendChannel.onmessage = this.onChannelMessage.bind(this);
    this.sendChannel.onopen = () => {
      this.logger.debug("Channel opened")();
    };
    this.sendChannel.onclose = () => {
      this.logger.log("Closed channel ")();
    };
  }

  private waitForAnswer() {
    this.createPeerConnection();
    this.pc!.ondatachannel = this.gotReceiveChannel.bind(this);
    this.wsHandler.acceptFile(this.connectionId, this.receivedSize);
  }
}
