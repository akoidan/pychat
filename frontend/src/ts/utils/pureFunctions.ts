
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


import {MessageStatus} from '@common/model/enum/message.status';
import type {
  FileModel,
  MessageModel,
} from "@/ts/types/model";
import {MessageStatusInner} from '@/ts/types/model';
import type {DefaultStore} from "@/ts/classes/DefaultStore";
import type {MessageSender} from "@/ts/types/types";
import {ALLOW_EDIT_MESSAGE_IF_UPDATE_HAPPENED_MS_AGO} from "@/ts/utils/consts";


export function bytesToSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes < 1) {
    return "0 Byte";
  }
  const power: number = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${Math.round(bytes / 1024 ** power)} ${sizes[power]}`;
}

export function hexEncode(v: string) {
  let hex, i;
  let result = "";
  for (i = 0; i < v.length; i++) {
    hex = v.charCodeAt(i).toString(16);
    result += `\\u${`000${hex}`.slice(-4)}`;
  }
  return result;
}

export function getChromeVersion() {
  const raw = (/Chrom(e|ium)\/([0-9]+)\./).exec(navigator.userAgent);

  return raw ? parseInt(raw[2], 10) : false;
}

export function getStreamLog(m: MediaStream | null): MediaStream | string | null {
  if (!m) {
    return null;
  }
  if (!m.id) {
    return m;
  }
  return `sream:${m.id};${m.active ? "active" : "inactive"};audio=${m.getAudioTracks().length};video=${m.getVideoTracks().length}`;
}

export function getTrackLog(m: MediaStreamTrack | null): MediaStreamTrack | string | null {
  if (!m) {
    return null;
  }
  if (!m.id) {
    return m;
  }
  return `track:${m.id};${(m as any).active ? "active" : "inactive"}`;
}

export function extractError(args: unknown[] | unknown | {name: string}) {
  try {
    let value: {name: string; message: string; rawError: string} = args as {name: string; message: string; rawError: string};
    if (typeof args === "string") {
      return args;
    } else if ((<unknown[]>args).length > 1) {
      return Array.prototype.join.call(args, " ");
    } else if ((<unknown[]>args).length === 1) {
      value = (<unknown[]>args)[0] as {name: string; message: string; rawError: string};
    }
    if (value && (value.name || value.message)) {
      return `${value.name}: ${value.message}`;
    } else if (value.rawError) {
      return value.rawError;
    }
    return JSON.stringify(value);
  } catch (e) {
    return `Error during parsing error ${e}, :(`;
  }
}

export function getMissingIds(roomId: number, store: DefaultStore): number[] {
  const {messages} = store.roomsDict[roomId];
  return Object.values(messages).filter((m) => m.parentMessage && !messages[m.parentMessage]).
    map((m) => m.parentMessage!);
}

export function checkIfIdIsMissing(message: MessageModel, store: DefaultStore): boolean {
  return Boolean(message.parentMessage) && !store.roomsDict[message.roomId].messages[message.parentMessage!];
}

export function showAllowEditing(message: MessageModel) {

  /*
   * Do nto allow edit message longer than 1 day, because it will appear on other history, which would be weird
   * in the history of last week a message edited 1 year ago would be always on top
   */
  return Date.now() - message.time < ALLOW_EDIT_MESSAGE_IF_UPDATE_HAPPENED_MS_AGO || message.id < 0;
}

export function editMessageWs(
  messageContent: string | null,
  messageId: number,
  roomId: number,
  symbol: string | null,
  files: Record<number, FileModel> | null,
  tags: Record<string, number>,
  time: number,
  edited: number,
  parentMessage: number | null,
  store: DefaultStore,
  ms: MessageSender,
): void {
  const shouldBeSynced: boolean = messageId > 0 || Boolean(messageContent);
  const oldMessage = store.roomsDict[roomId].messages[messageId];
  const mm: MessageModel = {
    roomId,
    deleted: !messageContent,
    id: messageId,
    isHighlighted: oldMessage ? oldMessage.isHighlighted : false,
    transfer: Boolean(messageContent) || messageId > 0 ? { // TODO can this be simplified?
      error: null,
      upload: null,
      abortFn: null,
    } : null,
    time,
    tags,
    threadMessagesCount: oldMessage ? oldMessage.threadMessagesCount : 0,
    isEditingActive: oldMessage ? oldMessage.isEditingActive : false,
    isThreadOpened: oldMessage ? oldMessage.isThreadOpened : false,
    parentMessage,
    status: shouldBeSynced ? MessageStatusInner.SENDING : MessageStatus.ON_SERVER,
    content: messageContent,
    symbol,
    edited,
    files,
    userId: store.userInfo?.id!,
  };
  store.addMessage(mm);
  if (shouldBeSynced) { // Message hasn't been sync to server and was deleted localy
    ms.syncMessage(roomId, messageId);
  }
}

export function buildQueryParams(params: Record<string, number | string>) {
  return Object.keys(params).map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).
    join("&");
}

export function bounce(ms: number): (cb: Function) => void {
  let stack: number | null;
  let lastCall: Function;

  return function(cb) {
    lastCall = cb;
    if (!stack) {
      stack = window.setTimeout(() => {
        stack = null;
        lastCall();
      }, ms);
    }
  };
}

export function getDay(dateObj: Date) {
  const month = dateObj.getUTCMonth() + 1; // Months from 1-12
  const day = dateObj.getUTCDate();
  const year = dateObj.getUTCFullYear();

  return `${year}/${month}/${day}`;
}
