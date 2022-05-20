
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


import {ImageType} from '@common/model/enum/image.type';
import {Gender} from '@common/model/enum/gender';
import {MessageStatus} from '@common/model/enum/message.status';
import type {LogLevel} from "lines-logger";


export enum GrowlType {
  SUCCESS = "col-success", INFO = "col-info", ERROR = "col-error",
}

export interface GrowlModel {
  id: number;
  html: string;
  type: GrowlType;
}

export type permissions_type = ("audio" | "video")[];

export interface PlatformUtil {
  askPermissions(...askedPermissions: permissions_type): Promise<void>;
}

export interface EditingMessage {
  messageId: number;
  roomId: number;
  isEditingNow: boolean;
}


export interface CurrentUserSettingsModel {
  embeddedYoutube: boolean;
  highlightCode: boolean;
  incomingFileCallSound: boolean;
  messageSound: boolean;
  onlineChangeSound: boolean;
  showWhenITyping: boolean;
  suggestions: boolean;
  theme: string;
  logs: LogLevel;
}

export interface GoogleCaptcha {
  render(div: HTMLElement, options: any): void;

  reset(): void;
}

export interface PastingTextAreaElement {
  elType: "blob";
  content: string;
  roomId: number;
  editedMessageId: number | null;
  openedThreadId: number | null;
}

export interface CurrentUserInfoModel extends CurrentUserInfoWoImage {
  thumbnail: string | null;
}

export interface CurrentUserInfoWoImage {
  id: number;
  username: string;
  name: string;
  city: string;
  surname: string;
  email: string;
  birthday: Date;
  contacts: string;
  sex: Gender;
}


export interface UserModel {
  username: string;
  id: number;
  sex: Gender;
  thumbnail: string;
  lastTimeOnline: number;
  location: Location;
}

export interface Location {
  city: string | null;
  country: string | null;
  countryCode: string | null;
  region: string | null;
}

export interface FileModel {
  url: string | null;
  type: ImageType;
  name?: string; // TODO
  serverId: number | null;
  previewFileId: number | null;
  fileId: number | null;
  preview: string | null;
  sending: boolean;
}

export interface UploadProgressModel {
  total: number;
  uploaded: number;
}

export interface MessageTransferInfo {
  upload: UploadProgressModel | null;
  error: string | null;
  abortFn: (() => void) | null;
}

export interface MessageModel {
  id: number;
  time: number;
  parentMessage: number | null;
  files: Record<string, FileModel> | null; // THIS IS STRING, not number!!
  content: string | null;
  tags: Record<string, number>; // User id
  isHighlighted: boolean; // If not read
  isEditingActive: boolean; // If textarea is opened for this message to edit it
  isThreadOpened: boolean; // If thread is opened for this message
  symbol: string | null;
  threadMessagesCount: number;
  deleted: boolean;
  status: MessageStatusModel;
  edited: number;
  roomId: number;
  userId: number;
  transfer: MessageTransferInfo | null;
}

export enum MessageStatusInner {
  SENDING = "SENDING",
}
export type MessageStatusModel = MessageStatus | MessageStatusInner;


export interface RoomSettingsModel {
  id: number;
  name: string;
  channelId: number | null;
  p2p: boolean;
  isMainInChannel: boolean;
  notifications: boolean;
  volume: number;
  creatorId: number;
}

export type UserDictModel = Record<string, UserModel>;

export type RoomDictModel = Record<string, RoomModel>;

export type ChannelsDictModel = Record<string, ChannelModel>;

export type ChannelsDictUIModel = Record<string, ChannelUIModel>;

export interface SearchModel {
  searchActive: boolean; // If true search panel is shown
  messages: Record<number, MessageModel>;
  searchText: string;
  locked: boolean; // If true, no more messages with this search is available from the server
}

export interface RoomLog {
  userId: number;
  action: "appeared online" | "been invited to this room" | "gone offline" | "joined this room" | "left this room";
  time: number;
}

export interface ChangeRoomName {
  oldName: string;
  newName: string;
  time: number;
}

export interface SendingFileTransfer {
  status: FileTransferStatus;
  userId: number;
  upload: UploadProgressModel;
  error: string | null;
}

export enum FileTransferStatus {
  NOT_DECIDED_YET, DECLINED_BY_OPPONENT, DECLINED_BY_YOU, FINISHED, ERROR, IN_PROGRESS,
}

export interface ReceivingFile {
  time: number;
  upload: UploadProgressModel;
  status: FileTransferStatus;
  fileName: string;
  threadId: number | null;
  opponentWsId: string;
  roomId: number;
  connId: string;
  anchor: string | null;
  error: string | null;
  userId: number;
}

export interface SendingFile {
  time: number;
  fileName: string;
  threadId: number | null;
  roomId: number;
  connId: string;
  fileSize: number;
  transfers: Record<string, SendingFileTransfer>;
}

export interface CallInfoModel {
  mediaStreamLink: string | null;
  connected: boolean;
  userId: number;
  opponentCurrentVoice: number;
}

export interface P2pMessageModel {
  liveConnections: string[];
}

export interface CallsInfoModel {
  calls: Record<string, CallInfoModel>;
  callActiveButNotJoinedYet: boolean;
  showMic: boolean;
  currentMicLevel: number; // Voice
  mediaStreamLink: string | null;
  currentMic: string | null;
  currentSpeaker: string | null;
  currentWebcam: string | null;
  showVideo: boolean;
  shareScreen: boolean;
  sharePaint: boolean;
  callActive: boolean;
}

export interface ChannelModel {
  expanded: boolean;
  id: number;
  name: string;
  creatorId: number;
}

export interface ChannelUIModel extends ChannelModel {
  rooms: RoomModel[];
  mainRoom: RoomModel;
}

export interface RoomModel extends RoomSettingsModel {
  users: number[];
  callInfo: CallsInfoModel;
  p2pInfo: P2pMessageModel;
  sendingFiles: Record<string, SendingFile>;
  receivingFiles: Record<string, ReceivingFile>;
  messages: Record<number, MessageModel>;
  allLoaded: boolean;
  search: SearchModel;
  usersTyping: Record<number, number>;
  roomLog: RoomLog[];
  changeName: ChangeRoomName[];
}

export interface IncomingCallModel {
  roomId: number;
  userId: number;
  connId: string;
}
