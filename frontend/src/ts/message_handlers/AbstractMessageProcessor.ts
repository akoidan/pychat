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
import type {Logger} from "lines-logger";
import loggerFactory from "@/ts/instances/loggerFactory";
import type {MessageSupplier} from "@/ts/types/types";
import type {DefaultStore} from "@/ts/classes/DefaultStore";


export default class AbstractMessageProcessor {
  protected readonly callBacks: Record<number, {resolve: Function; reject: Function}> = {};

  protected readonly logger: Logger;

  /*
   * Also uniqueMessageId is used on sendingMessage, in storage.getUniqueMessageId.
   * the difference is that this is positive integers
   * and another one uses negatives
   */
  protected uniquePositiveMessageId: number = 0;

  protected readonly target: MessageSupplier;

  protected readonly store: DefaultStore;

  private readonly loggerIn: Logger;

  private readonly loggerOut: Logger;

  public constructor(target: MessageSupplier, store: DefaultStore, label: string) {
    this.target = target;
    this.store = store;
    this.loggerIn = loggerFactory.getLoggerColor(`${label}:in`, "#4c002b");
    this.loggerOut = loggerFactory.getLoggerColor(`${label}:out`, "#4c002b");
    this.logger = loggerFactory.getLoggerColor("mes-proc", "#4c002b");
  }

  public setMessageCbId<D>(message: RequestWsOutMessage<string, D>) {
    if (message.cbId) {
      throw Error("Cb id should ge generated by this");
    }
    // Should be ++, so uniqueId won't be 0, if it's 0 then checks like !0 are false, but should be true
    message.cbId = ++this.uniquePositiveMessageId;
  }

  public parseMessage<D>(jsonData: string): DefaultWsInMessage<string, HandlerName, D> | null | ResponseWsInMessage<D> {
    let data: DefaultWsInMessage<string, HandlerName, any> | null = null;
    try {
      data = JSON.parse(jsonData);
      this.logData(this.loggerIn, jsonData, data!)();
    } catch (e) {
      this.logger.error("Unable to parse incomming message {}", jsonData)();

      return null;
    }
    return data;
  }

  public async sendToServerAndAwait<D, RES>(message: RequestWsOutMessage<string, D>): Promise<ResponseWsInMessage<RES>> {
    return new Promise((resolve, reject) => {
      this.setMessageCbId<D>(message);
      const jsonMessage = this.getJsonMessage(message);
      this.callBacks[message.cbId!] = {
        resolve,
        reject,
      };
      const isSent = this.target.sendRawTextToServer(jsonMessage);
      if (isSent) {
        this.logData(this.loggerOut, jsonMessage, message)();
      }
    });
  }

  sendToServer<D>(message: DefaultWsOutMessage<string, D>): boolean {
    const jsonMessage = this.getJsonMessage(message);
    const isSent = this.target.sendRawTextToServer(jsonMessage);
    if (isSent) {
      this.logData(this.loggerOut, jsonMessage, message)();
    }
    return isSent;
  }

  public getJsonMessage<D>(message: DefaultWsOutMessage<string, D>) {
    return JSON.stringify(message);
  }

  public onDropConnection(reasong: string) {
    for (const cb in this.callBacks) {
      try {
        this.logger.debug("Resolving cb {}", cb)();
        const cbFn = this.callBacks[cb];
        delete this.callBacks[cb];
        cbFn.reject(reasong);
        this.logger.debug("Cb {} has been resolved", cb)();
      } catch (e) {
        this.logger.debug("Error {} during resolving cb {}", e, cb)();
      }
    }
  }

  private logData<D>(logger: Logger, jsonData: string, message: DefaultWsInMessage<string, HandlerName, D> | DefaultWsOutMessage<string, D>): () => void {
    let raw = jsonData;
    if (raw.length > 1000) {
      raw = "";
    }
    if (message.action === "ping" || message.action === "pong") {
      return logger.debug("{} {}", raw, message);
    }
    return logger.log("{} {}", raw, message);
  }
}
