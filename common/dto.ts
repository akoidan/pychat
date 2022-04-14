
export interface SignInRequest extends CaptchaRequest {
  username?: string;
  password: string;
  email?: string;
}

export interface SendRestorePasswordRequest extends CaptchaRequest {
  username?: string;
  email?: string;
}

export interface VerifyTokenRequest {
  token: string;
}

export interface AcceptTokenRequest {
  token: string;
  password: string;
}

export interface AcceptTokenResponse extends SessionResponse {

}

export interface VerifyTokenResponse extends OkResponse {
  username: string;
}

export interface SendRestorePasswordResponse extends OkResponse {
}

export interface CaptchaRequest {
  captcha?: string;
}

export interface GoogleAuthRequest {
  token: string;
}

export interface FaceBookAuthRequest {
  token: string;
}

export interface ValidateUserRequest {
  username: string;
}

export interface SignUpRequest {
  username: string;
  password: string;
  email?: string;
  sex?: Gender;
}

export interface ConfirmEmailRequest {
  token: string;
}

export interface ConfirmEmailResponse extends OkResponse {
}

export interface SessionResponse {
  session: string;
}

export interface SignInResponse extends SessionResponse {

}


interface TypeGeneratorForOauth1 extends SessionResponse {
  isNewAccount: true;
  username: string;
}

interface TypeGeneratorForOauth2 extends SessionResponse {
  isNewAccount: false
}

export type OauthSessionResponse =
  TypeGeneratorForOauth1
  | TypeGeneratorForOauth2;


export type GoogleSignInResponse = OauthSessionResponse;
export type FacebookSignInResponse = OauthSessionResponse;

export interface SignUpResponse extends SessionResponse {

}

export interface OkResponse {
  ok: true;
}

export interface ValidateUserResponse extends OkResponse {

}

export interface ValidateEmailResponse extends OkResponse {

}

export interface ValidateUserEmailRequest {
  email: string;
}

// ISO/IEC 5218 1 male, 2 - female
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum MessageStatus {
  ON_SERVER = 'ON_SERVER',  // uploaded to server
  READ = 'READ',
  RECEIVED = 'RECEIVED', //sent
}

export enum Theme {
  COLOR_LOR = 'COLOR_LOR',
  COLOR_REG = 'COLOR_REG',
  COLOR_WHITE = 'COLOR_WHITE'
}


export enum VerificationType {
  REGISTER = 'REGISTER', // when user sign up with email, we want to confirm that it's his/her email
  PASSWORD = 'PASSWORD', // when user request a pasword change
  EMAIL = 'EMAIL', // when user changes an email
}

export enum ImageType {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  GIPHY = 'GIPHY'
}

export enum UploadedFileChoices {
  VIDEO = 'VIDEO',
  FILE = 'FILE',
  MEDIA_RECORD = 'MEDIA_RECORD',
  AUDIO_RECORD = 'AUDIO_RECORD',
  IMAGE = 'IMAGE',
  PREVIEW = 'PREVIEW',
  ISSUE = 'ISSUE'
}




/** BasemessagesInterfaces.ts */


export interface ChangeUserOnlineBase {
  content: Record<number, string[]>;
  userId: number;
  lastTimeOnline: number;
  time: number;
}

/*
 * Any means that every every registered subscriber will be called with this handler if it exists
 * this means, that handler that registered this event will be called
 * void means that no handlers should process this signal
 */
export type HandlerName =
  "*"
  | "call"
  | "notifier"
  | "peerConnection:*"
  | "room"
  | "router"
  | "void"
  | "webrtc-message"
  | "webrtc"
  | "webrtcTransfer:*"
  | "ws-message"
  | "ws";
export type CallHandlerName =
  HandlerName
  | "dummyCall";

export type HandlerType<A extends string, H extends HandlerName> = (a: DefaultInMessage<A, H | "*">) => Promise<void> | void;

export type HandlerTypes<K extends string, H extends HandlerName> = {
  [Key in K]?: HandlerType<Key, H>
};

export interface AcceptFileContent {
  received: number;
}

export interface ReplyWebRtc extends WebRtcDefaultMessage, OpponentWsId {
  content: BrowserBase;
  userId: number;
}

export interface NewRoom {
  inviterUserId: number;
  time: number;
}

export interface RoomExistedBefore {
  inviteeUserId: number[];
}

export interface AddRoomBase extends NewRoom, Omit<ChannelDto, "channelId">, RoomDto {
}

export interface OpponentWsId {
  opponentWsId: string;
}

export interface WebRtcDefaultMessage {
  connId: string;
}

export interface OfferFileContent extends BrowserBase {
  size: number;
  name: string;
}

export type ChangeDeviceType =
  "i_deleted"
  | "invited"
  | "room_created"
  | "someone_joined"
  | "someone_left";
export type ChangeOnlineType =
  "appear_online"
  | "gone_offline";

export interface BrowserBase {
  browser: string;
}

export interface CallBackMessage {
  // Request to send response with this callback id
  cbId?: number;
}

export interface DefaultMessage<A extends string> {
  action: A;
}

export interface DefaultInMessage<A extends string, H extends HandlerName> extends DefaultMessage <A> {
  handler: H;
}

export interface ResolveCallbackId {
  resolveCbId?: number; // If this callback id is present, resolve it
}

export interface IMessageHandler {
  handle(message: DefaultInMessage<string, HandlerName>): void;

  getHandler<H extends HandlerName, A extends string>(message: DefaultInMessage<A, H>): HandlerType<A, H> | undefined;
}

export type CallStatus =
  "accepted"
  | "not_inited"
  | "received_offer"
  | "sent_offer";



/** wsInMessages.ts */
/**
 * This file should only contain structures created by server. Only BE -> FE by websockets
 * and processed by MessageHandler
 */

// import type {
//   ChannelDto,
//   LocationDto,
//   MessageModelDto,
//   RoomDto,
//   RoomNoUsersDto,
//   UserDto,
//   UserProfileDto,
//   UserProfileDtoWoImage,
//   UserSettingsDto,
// } from "@/ts/types/dto";
//
// import type {
//   AcceptFileContent,
//   AddRoomBase,
//   BrowserBase,
//   CallBackMessage,
//   ChangeUserOnlineBase,
//   DefaultInMessage,
//   HandlerName,
//   NewRoom,
//   OfferFileContent,
//   OpponentWsId,
//   ReplyWebRtc,
//   RoomExistedBefore,
//   WebRtcDefaultMessage,
// } from "@/ts/types/backend";
// import type {MessageStatus} from "@/ts/types/model";

export interface DefaultWsInMessage<A extends string, H extends HandlerName> extends DefaultInMessage<A, H>, CallBackMessage {
  cbBySender?: string;
  cbId?: number;
}

export interface MessagesResponseMessage {
  content: MessageModelDto[];
}

export interface SyncHistoryResponseMessage extends MessagesResponseMessage {
  readMessageIds: number[];
  receivedMessageIds: number[];
}

export interface DeleteMessage extends DefaultWsInMessage<"deleteMessage", "ws-message"> {
  roomId: number;
  id: number;
  edited: number;
}

export interface SetMessageStatusMessage extends DefaultWsInMessage<"setMessageStatus", "ws-message"> {
  roomId: number;
  status: MessageStatus;
  messagesIds: number[];
}

export interface EditMessage extends DefaultWsInMessage<"editMessage", "ws-message">, MessageModelDto {
}

export interface PrintMessage extends DefaultWsInMessage<"printMessage", "ws-message">, MessageModelDto {
}

export interface AddOnlineUserMessage extends DefaultWsInMessage<"addOnlineUser", "room">, ChangeUserOnlineBase {
  opponentWsId: string;
}

export interface CreateNewUsedMessage extends DefaultWsInMessage<"createNewUser", "room">, UserDto {
  rooms: {
    roomId: number;
    users: number[];
  }[];
}

export interface RemoveOnlineUserMessage extends DefaultWsInMessage<"removeOnlineUser", "room">, ChangeUserOnlineBase {
}

export interface DeleteRoomMessage extends DefaultWsInMessage<"deleteRoom", "room"> {
  roomId: number;
}

export interface GetCountryCodeMessage extends DefaultInMessage<"getCountryCode", "void"> {
  content: Record<string, LocationDto>;
}

export interface LeaveUserMessage extends DefaultWsInMessage<"leaveUser", "room"> {
  roomId: number;
  userId: number;
  users: number[];
}

export interface AddChannelMessage extends DefaultWsInMessage<"addChannel", "room">, ChannelDto, Omit<RoomDto, "channelId">, NewRoom {
  channelUsers: number[];
}

export interface InviteUserMessage extends NewRoom, RoomExistedBefore, DefaultWsInMessage<"inviteUser", "room"> {
  roomId: number;
  users: number[];
}

export interface AddInviteMessage extends AddRoomBase, RoomExistedBefore, DefaultWsInMessage<"addInvite", "room"> {
}

export interface SaveChannelSettingsMessage extends DefaultWsInMessage<"saveChannelSettings", "room">, ChannelDto {
  notifications: boolean;
  volume: number;
  p2p: boolean;
  userId: number;
}

export interface DeleteChannelMessage extends DefaultWsInMessage<"deleteChannel", "room"> {
  channelId: number;
  roomIds: number[];
}

export interface SaveRoomSettingsMessage extends DefaultWsInMessage<"saveRoomSettings", "room">, RoomNoUsersDto {
}

export interface ShowITypeMessage extends DefaultWsInMessage<"showIType", "room"> {
  roomId: number;
  userId: number;
}

export interface SetWsIdMessage extends DefaultWsInMessage<"setWsId", "ws">, OpponentWsId {
  rooms: RoomDto[];
  channels: ChannelDto[];
  users: UserDto[];
  online: Record<number, string[]>;
  time: number;
  profile: UserProfileDto;
  settings: UserSettingsDto;
}

export interface WebRtcSetConnectionIdMessage extends WebRtcDefaultMessage, DefaultWsInMessage<"setConnectionId", "void"> {
  time: number;
}

export interface AddRoomMessage extends AddRoomBase, DefaultWsInMessage<"addRoom", "room"> {
  channelUsers: number[];
  channelId: number;
}

export interface OfferFile extends WebRtcDefaultMessage, OpponentWsId, DefaultWsInMessage<"offerFile", "webrtc"> {
  content: OfferFileContent;
  roomId: number;
  threadId: number | null;
  userId: number;
  time: number;
}

export interface OfferCall extends WebRtcDefaultMessage, OpponentWsId, DefaultWsInMessage<"offerCall", "webrtc"> {
  content: BrowserBase;
  roomId: number;
  userId: number;
  time: number;
}

export interface ReplyCallMessage extends ReplyWebRtc, DefaultWsInMessage<"replyCall", "webrtcTransfer:*"> {

}

export interface NotifyCallActiveMessage extends DefaultWsInMessage<"notifyCallActive", "webrtc">, WebRtcDefaultMessage, OpponentWsId {
  roomId: number;
  userId: number;
}

export interface DestroyCallConnection extends WebRtcDefaultMessage, OpponentWsId, DefaultWsInMessage<"destroyCallConnection", "peerConnection:*"> {
  content: string;
}

export interface OfferMessage extends WebRtcDefaultMessage, OpponentWsId, DefaultWsInMessage<"offerMessage", "webrtc"> {
  content: BrowserBase;
  roomId: number;
  userId: number;
  time: number;
}

export interface SetSettingsMessage extends DefaultWsInMessage<"setSettings", "ws"> {
  content: UserSettingsDto;
}

export interface SetUserProfileMessage extends DefaultWsInMessage<"setUserProfile", "ws"> {
  content: UserProfileDtoWoImage;
}

export interface UserProfileChangedMessage extends DefaultWsInMessage<"userProfileChanged", "ws">, UserDto {

}

export interface GrowlMessage {
  content: string;
  action: "growlError";
}

export interface PingMessage extends DefaultWsInMessage<"ping", "ws"> {
  time: string;
}

export interface PongMessage extends DefaultWsInMessage<"pong", "ws"> {
  time: string;
}

export interface ReplyFileMessage extends ReplyWebRtc, DefaultWsInMessage<"replyFile", "webrtcTransfer:*"> {

}

export interface SetProfileImageMessage extends DefaultWsInMessage<"setProfileImage", "ws"> {
  content: string;
}

export interface AcceptCallMessage extends WebRtcDefaultMessage, OpponentWsId, DefaultWsInMessage<"acceptCall", "webrtcTransfer:*"> {
}

export interface AcceptFileMessage extends DefaultWsInMessage<"acceptFile", "peerConnection:*"> {
  content: AcceptFileContent;
}

export interface SendRtcDataMessage extends WebRtcDefaultMessage, OpponentWsId, DefaultWsInMessage<"sendRtcData", "peerConnection:*"> {
  content: RTCIceCandidateInit | RTCSessionDescriptionInit | {message: unknown};
}

export type RetryFileMessage = DefaultWsInMessage<"retryFile", "peerConnection:*">;

export interface DestroyFileConnectionMessage extends DefaultWsInMessage<"destroyFileConnection", "peerConnection:*"> {
  content: "decline" | "success";
}

/** wsOutMEssages */
/**
 * This file only contains messages that sent to backend api. FE -> BE by websockets
 */

// import type {DefaultMessage} from "@/ts/types/backend";

export interface DefaultWsOutMessage<A extends string> extends DefaultMessage<A> {
  cbId?: number;
}

export interface SyncHistoryOutMessage extends DefaultWsOutMessage<"syncHistory"> {
  roomIds: number[];
  messagesIds: number[];
  onServerMessageIds: number[];
  receivedMessageIds: number[];
  lastSynced: number;
}



/// IMPORTED FROM OTHERS


export interface MessageModelDto {
  id: number;
  time: number;
  parentMessage: number;
  files?: Record<number, FileModelDto>;
  tags: Record<number, number>;
  content: string;
  status: MessageStatus;
  symbol?: string;
  deleted?: boolean;
  threadMessagesCount: number;
  edited: number;
  roomId: number;
  userId: number;
}


export interface UserDto {
  username: string;
  id: number;
  thumbnail: string;
  lastTimeOnline: number;
  sex: Gender;
}


export interface UserProfileDtoWoImage {
  username: string;
  name: string;
  city: string;
  surname: string;
  email: string;
  birthday: Date;
  contacts: string;
  sex: Gender;
  id: number;
}

export declare type LogLevel = 'log_raise_error' | 'log_with_warnings' | 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'disable';

export interface UserSettingsDto {
  embeddedYoutube: boolean;
  highlightCode: boolean;
  incomingFileCallSound: boolean;
  messageSound: boolean;
  onlineChangeSound: boolean;
  showWhenITyping: boolean;
  suggestions: boolean;
  logs: LogLevel;
  theme: string;
}


export interface RoomNoUsersDto {
  channelId: number | null;
  notifications: boolean;
  p2p: boolean;
  volume: number;
  isMainInChannel: boolean;
  id: number;
  name: string;
  creatorId: number;
}

export interface UserProfileDto extends UserProfileDtoWoImage {
  thumbnail: string;
}


export interface LocationDto {
  city: string;
  country: string;
  countryCode: string;
  region: string;
}


export interface ChannelDto {
  name: string;
  id: number;
  creatorId: number;
}

export interface RoomDto extends RoomNoUsersDto {
  users: number[];
}


export interface FileModelDto {
  url: string;
  id: number;
  type: BlobType;
  preview: string;
}

export type BlobType =
  "a"
  | "f"
  | "g"
  | "i"
  | "m"
  | "v";
