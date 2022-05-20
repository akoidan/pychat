
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
  PostData,
  UploadData
} from "@/ts/types/types";
import type {Logger} from "lines-logger";
import loggerFactory from "@/ts/instances/loggerFactory";
import {CONNECTION_ERROR} from "@/ts/utils/consts";

export default class Fetch {
  protected httpLogger: Logger;

  protected getHeaders: () => Record<string, string>;

  private readonly url: string;

  public constructor(url: string, getHeaders: () => Record<string, string>) {
    this.httpLogger = loggerFactory.getLogger("http");
    this.url = url;
    this.getHeaders = getHeaders;
  }

  public async doGet<T>(url: string, onSetAbortFunction?: (c: () => void) => void): Promise<T> {
    const {signal, fetchUrl, headers} = this.prepareRequest(url, onSetAbortFunction);
    const response = await fetch(fetchUrl, {
      method: "GET",
      mode: "cors",
      headers,
      signal,
    });
    return this.processResponse<T>(response);
  }

  public async doPost<T>(d: PostData): Promise<T> {
    const {headers, signal, fetchUrl} = this.prepareRequest(d.url, d.onSetAbortFunction, {
      "Content-Type": "application/json",
    });
    const response = await fetch(fetchUrl, {
      method: "POST",
      mode: "cors",
      signal,
      body: JSON.stringify(d.params),
      headers,
    });
    return this.processResponse<T>(response);
  }


  public async upload<T>({url, data, onSetAbortFunction, onProgress}: UploadData): Promise<T> {
     /*
      * https://ilikekillnerds.com/2020/09/file-upload-progress-with-the-fetch-api-is-coming/
      * https://chromestatus.com/feature/5274139738767360
      * fetch api doesnt support progress api yet
      */
    return new Promise((resolve, reject) => {
      const r = new XMLHttpRequest();
      r.addEventListener("load", () => {
        try {
          let response = JSON.parse(r.response);
          if (r.status < 200 || r.status >= 300) {
            this.processException(response);
          } else {
            resolve(response);
            return;
          }
        } catch (e) {
          reject(e);
          return;
        }
      });
      r.addEventListener("error", () => {
        reject(CONNECTION_ERROR);
      });
      if (onSetAbortFunction) {
        onSetAbortFunction(() => {
          r.abort();
        });
      }
      if (onProgress) {
        r.upload.addEventListener("progress", (evt) => {
          if (evt.lengthComputable) {
            onProgress(evt.loaded);
          }
        });
      }
      r.open("POST", `${this.url}${url}`);
      Object.entries(this.getHeaders()).forEach(([k, v]) => {
        r.setRequestHeader(k, v);
      });
      const form = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        form.append(key, value);
      });
      r.send(form);
    });
  }

  private async processResponse<T>(response: Response): Promise<T> {
    const body = await response.json();
    if (response.ok) {
      return body as T;
    }
    this.processException(body);
  }

  private processException(body: any): never {
    if (typeof body?.message === "string") {
      throw Error(body.message);
    } else if (body?.message?.length && typeof body.message[0] === "string") {
      throw Error(body.message[0]);
    } else if (typeof body?.error === "string") {
      throw Error(body.error);
    } else {
      throw Error("Network error");
    }
  }

  private prepareRequest(url: string, onSetAbortFunction?: (c: () => void) => void, headers: Record<string, string> = {}) {
    let signal = null;
    if (onSetAbortFunction) {
      const controller = new AbortController();
      signal = controller.signal;
      onSetAbortFunction(() => {
        controller.abort();
      });
    }
    Object.entries(this.getHeaders()).forEach(([k, v]) => {
      headers[k] = v;
    });
    return {
      signal,
      fetchUrl: `${this.url}${url}`,
      headers,
    };
  }
}
