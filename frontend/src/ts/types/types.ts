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
import type {CallInfoModel,
  ChannelModel,
  CurrentUserInfoModel,
  CurrentUserSettingsModel,
  FileModel,
  FileTransferStatus,
  MessageModel,
  RoomLog,
  RoomModel,
  RoomSettingsModel,
  SendingFileTransfer,
  UploadProgressModel,
  UserModel,
  MessageStatusModel} from "@/ts/types/model";
import type {SetStateFromStorage} from "@/ts/types/dto";



export type ValueFilterForKey<T extends object, U> = {
  [K in keyof T]: U extends T[K] ? K : never;
}[keyof T];


type StuctureMappedType<K extends string> = Record<K, K>;

export interface UserIdConn {
  connectionId: string;
  userId: number;
}

export interface MessageDataEncode {
  messageContent: string | null;
  files: Record<string, FileModel> | null;
  currSymbol: string;
  tags: Record<string, number>;
}

export enum VideoType {
  AUDIO, VIDEO, SHARE, PAINT,
}

export interface SetDevices {
  microphones: Record<string, string>;
  speakers: Record<string, string>;
  webcams: Record<string, string>;
  roomId: number;
}

export interface MessageSender {
  syncMessage(roomId: number, messageId: number): Promise<void>;

  loadMessages(roomId: number, messageId: number[]): Promise<void>;

  loadUpMessages(roomId: number, count: number): Promise<void>;

  loadThreadMessages(roomId: number, threadId: number): Promise<void>;

  loadUpSearchMessages(roomId: number, count: number, checkIfSet: (found: boolean) => boolean): Promise<void>;

  markMessagesInCurrentRoomAsRead(roomId: number, messageIds: number[]): Promise<void>;
}

export interface JsAudioAnalyzer {
  analyser: any;
  javascriptNode: any;
  prevVolumeValues: any;
  volumeValuesCount: any;
}

export interface SetUploadProgress {
  upload: UploadProgressModel;
  roomId: number;
  messageId: number;
}

export interface SetUploadXHR {
  abortFunction(): void;
  roomId: number;
  messageId: number;
}

export interface SetCallOpponent {
  roomId: number;
  opponentWsId: string;
  callInfoModel: CallInfoModel | null;
}

export interface MarkMessageAsRead {
  roomId: number;
  messageId: number;
}

export interface SetOpponentVolume {
  roomId: number;
  opponentWsId: string;
  volume: number;
}

export interface SetOpponentVoice {
  roomId: number;
  opponentWsId: string;
  voice: number;
}

export interface SetOpponentAnchor {
  roomId: number;
  opponentWsId: string;
  anchor: MediaStream;
}

export interface BooleanIdentifier {
  id: number;
  state: boolean;
}

export interface ShareIdentifier {
  id: number;
  type: "desktop" | "paint" | "webcam";
  state: boolean;
}

export interface NumberIdentifier {
  id: number;
  state: number;
}

export interface StringIdentifier {
  id: number;
  state: string;
}

export interface MediaIdentifier {
  id: number;
  media: MediaStream | null;
}

export interface RoomLogEntry {
  roomLog: RoomLog;
  roomIds: number[];
}

export interface SetMessageProgressError {
  messageId: number;
  roomId: number;
  error: string | null;
}

export interface SetFileIdsForMessage {
  messageId: number;
  roomId: number;
  files: SaveFileResponse[];
}

export interface RoomMessageIds {
  messageId: number;
  roomId: number;
  newMessageId: number;
}

export interface RoomMessagesIds {
  messagesId: number[];
  roomId: number;
}

export interface MessageSupplier {
  sendRawTextToServer(message: string): boolean;

  getWsConnectionId(): string;
}

export interface IStorage {
  // GetIds(cb: SingleParamCB<object>);
  saveMessages(messages: MessageModel[]): void;

  deleteMessage(id: number, replaceThreadId: number): void;

  setThreadMessageCount(mesageid: number, count: number): void;

  deleteRoom(id: number): void;

  deleteChannel(id: number): void;

  saveMessage(m: MessageModel): void;

  updateRoom(m: RoomSettingsModel): void;

  updateFileIds(m: SetFileIdsForMessage): void;

  setRooms(rooms: RoomSettingsModel[]): void;

  setChannels(channels: ChannelModel[]): void;

  saveRoom(room: RoomModel): void;

  saveChannel(room: ChannelModel): void;

  setUserProfile(user: CurrentUserInfoModel): void;

  setUserSettings(settings: CurrentUserSettingsModel): void;

  saveRoomUsers(ru: SetRoomsUsers): void;

  setUsers(users: UserModel[]): void;

  setMessagesStatus(messagesIds: number[], status: MessageStatusModel): void;

  saveUser(users: UserModel): void;

  clearStorage(): void;

  clearMessages(): void;

  connect(): Promise<SetStateFromStorage | null>;

  // GetRoomHeaderId(roomId: number, cb: SingleParamCB<number>);
  setRoomHeaderId(roomId: number, value: number): void;

  markMessageAsSent(messagesId: number[]): void;
}

export interface PostData {
  url: string;
  params: any;
  onSetAbortFunction?(c: () => void): void;
}

export interface UploadData {
  url: string;
  data: Record<string, any>;
  onSetAbortFunction?(e: () => void): void;
  onProgress?(i: number): void;
}

export interface AddSendingFileTransfer {
  roomId: number;
  connId: string;
  transferId: string;
  transfer: SendingFileTransfer;
}

export interface SetReceivingFileStatus {
  roomId: number;
  connId: string;
  status: FileTransferStatus;
  error?: string | null;
  anchor?: string;
}

export type ConnectionStatus =
  "closed"
  | "new";

interface SetSendingFileBase {
  roomId: number;
  connId: string;
  transfer: string;
}

export interface SetSendingFileUploaded extends SetSendingFileBase {
  uploaded: number;
}

export interface SetReceivingFileUploaded {
  roomId: number;
  connId: string;
  uploaded: number;
}

export interface SetSendingFileStatus extends SetSendingFileBase {
  status: FileTransferStatus;
  error: string | null;
}

export interface MessagesLocation {
  roomId: number;
  messages: MessageModel[];
}

export interface AddMessagesDTO extends MessagesLocation {
  syncingThreadMessageRequired?: true;
}

export interface LiveConnectionLocation {
  roomId: number;
  connection: string;
}

export interface PrivateRoomsIds {
  userRooms: Record<number, number>;
  roomUsers: Record<number, number>;
}

export interface IMessageHandler {
  handle<H extends HandlerName>(message: DefaultWsInMessage<string, H, HandlerName>): void;

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  getHandler<H extends HandlerName, A extends string>(message: DefaultWsInMessage<A, H, any>): HandlerType<any, any> | undefined;
}

export type HandlerType<K extends string, A extends DefaultWsInMessage<K, HandlerName, A["data"]>> = (a: A["data"]) => Promise<void> | void;

export type HandlerTypes<K extends string> = {
  [Key in K]?: HandlerType<Key, any>
};

export interface SetRoomsUsers {
  roomId: number;
  users: number[];
}

export interface RemoveMessageProgress {
  messageId: number;
  roomId: number;
}

export interface SetMessageProgress extends RemoveMessageProgress {
  uploaded: number;
}

export interface SetSearchStateTo {
  roomId: number;
  lock: boolean;
}

export interface SetSearchTextTo {
  roomId: number;
  searchText: string;
}

export enum IconColor {
  SUCCESS = "success", ERROR = "error", WARN = "warn", NOT_SET = "",
}

export interface SessionHolder {
  session: string | null;
}
