
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


import loggerFactory from "@/ts/instances/loggerFactory";
import type {
  IStorage,
  SetFileIdsForMessage,
  SetRoomsUsers,
} from "@/ts/types/types";
import type {
  ChannelModel,
  CurrentUserInfoModel,
  CurrentUserSettingsModel,
  MessageModel,
  RoomSettingsModel,
  UserModel,
} from "@/ts/types/model";
import {MessageStatusModel} from '@/ts/types/model';
import type {Logger} from "lines-logger";

interface LocalStorageMessage {
  f: number;
  h: number;
}

export default class LocalStorage implements IStorage {
  private readonly logger: Logger;

  private readonly STORAGE_NAME = "wsHeaderIds";

  private cache: Record<number, LocalStorageMessage> = {};

  public constructor() {
    this.logger = loggerFactory.getLogger("localStor");
    const ms = localStorage.getItem(this.STORAGE_NAME);
    if (ms) {
      const loaded = JSON.parse(ms);
      for (const k in loaded) {
        this.cache[parseInt(k)] = {
          h: loaded[k],
          f: loaded[k],
        };
      }
    } else {
      localStorage.setItem(this.STORAGE_NAME, "{}");
    }
  }

  /*
   * Public getIds(cb: SingleParamCB<object>) {
   *   cb(this.cache);
   * }
   */

  public saveMessage(message: MessageModel) {
    this.setRoomHeaderId(message.roomId, message.id);
  }

  public saveMessages(messages: MessageModel[]) {
    messages.forEach((message) => {
      this.applyCache(message.roomId, message.id);
    });
    const lm = JSON.parse(localStorage.getItem(this.STORAGE_NAME) || "{}");
    for (const k in this.cache) {
      if (!lm[k] || this.cache[k].h < lm[k]) {
        lm[k] = this.cache[k].h;
      }
    }
    localStorage.setItem(this.STORAGE_NAME, JSON.stringify(lm));
  }

  public updateFileIds(m: SetFileIdsForMessage) {
  }

  public deleteMessage(id: number, replaceThreadId: number) {
  }

  public setThreadMessageCount(mesageid: number, count: number): void {
  }

  public deleteRoom(id: number) {
  }

  public deleteChannel(id: number) {
  }

  public updateRoom(m: RoomSettingsModel) {
  }

  public setRooms(rooms: RoomSettingsModel[]) {
  }

  public setChannels(channels: ChannelModel[]) {
  }

  public saveRoom(room: RoomSettingsModel) {
  }

  public saveChannel(room: ChannelModel) {
  }

  public setUserProfile(user: CurrentUserInfoModel) {
  }

  public setUserSettings(settings: CurrentUserSettingsModel) {
  }

  public saveRoomUsers(ru: SetRoomsUsers) {
  }

  public setUsers(users: UserModel[]) {
  }

  public setMessagesStatus(messagesIds: number[], status: MessageStatusModel) {
  }

  public saveUser(users: UserModel) {
  }

  public markMessageAsSent(m: number[]) {
  }

  public clearMessages() {
    this.clearStorage();
  }

  public clearStorage() {
    localStorage.setItem(this.STORAGE_NAME, "{}");
    this.cache = {};
  }

  public setRoomHeaderId(roomId: number, value: number) {
    if (!this.applyCache(roomId, value)) {
      this.saveJson(roomId, value);
    }
  }

  public async connect(): Promise<null> {
    return null;
  }

  /*
   * Public getRoomHeaderId(roomId: number, cb: SingleParamCB<number>) {
   *   cb(this.cache[roomId] ? this.cache[roomId].h : null);
   * }
   */

  private applyCache(roomId: number, value: number): boolean {
    if (!this.cache[roomId]) {
      this.cache[roomId] = {
        h: value,
        f: value,
      };
    } else if (value < this.cache[roomId].h) {
      this.cache[roomId].h = value;
    } else if (value > this.cache[roomId].f) {
      this.cache[roomId].f = value;
    } else {
      return true;
    }

    return false;
  }

  private saveJson(roomId: number, value: number) {
    const lm = JSON.parse(localStorage.getItem(this.STORAGE_NAME) || "{}");
    if (!lm[roomId] || value < lm[roomId]) {
      lm[roomId] = value;
      this.logger.debug("Updating headerId {} -> {} for room {}. LS: {}", lm[roomId], value, roomId, lm)();
      localStorage.setItem(this.STORAGE_NAME, JSON.stringify(lm));
    } else {
      this.logger.debug("Loaded header ids for room {} from local storage {} . Update is not needed since stored header {} is lower than current ", roomId, lm, lm[roomId], value)();
    }
  }
}
