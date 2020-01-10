import {FileModelDto, MessageModelDto, RoomDto, SexModelDto, UserDto, UserProfileDto, UserSettingsDto} from "@/types/dto";
import {FileModel} from "@/types/model";

export interface DefaultSentMessage {
  action: string;
  messageId?: number;
}

export interface DefaultMessage extends DefaultSentMessage {
  handler: string;
  cbBySender?: string;
}

export interface WebRtcDefaultMessage extends DefaultMessage {
  connId: string;
}

export interface WebRtcSetConnectionIdMessage extends WebRtcDefaultMessage {
  time: number;
}

export interface ScreenShareData {
  audio: boolean;
  video: {
    mandatory: {
      chromeMediaSource: string;
      chromeMediaSourceId: string;
      maxWidth: number;
      maxHeight: number;
    };
  };
}

export interface SetWsIdMessage extends DefaultMessage, OpponentWsId {
  rooms: RoomDto[];
  users: UserDto[];
  online: number[];
  time: number;
  userImage: string;
  userInfo: UserProfileDto;
  userSettings: UserSettingsDto;
}
export interface ConnectToRemoteMessage extends DefaultMessage {
  stream: MediaStream|null;
}

export interface OfferFileContent extends BrowserBase {
  size: number;
  name: string;
}

export interface BrowserBase {
  browser: string;
}

export interface OpponentWsId {
  opponentWsId: string;
}
export interface OnSendRtcDataMessage extends WebRtcDefaultMessage, OpponentWsId {
  content: RTCSessionDescriptionInit | RTCIceCandidateInit| {message: unknown};
}

export type CallStatus = "not_inited"|"sent_offer"| "received_offer" | "accepted";

export interface OfferFile extends WebRtcDefaultMessage, OpponentWsId {
  content: OfferFileContent;
  roomId: number;
  userId: number;
  time: number;
}

export interface OfferCall extends WebRtcDefaultMessage, OpponentWsId {
  content: BrowserBase;
  roomId: number;
  userId: number;
  time: number;
}

export interface SetSettingsMessage extends DefaultMessage {
  content: UserSettingsDto;
}
export interface SetUserProfileMessage extends DefaultMessage {
  content: UserProfileDto;
}

interface ReplyWebRtc extends WebRtcDefaultMessage, OpponentWsId {
  content: BrowserBase;
  userId: number;
}

export type ReplyFileMessage = ReplyWebRtc;

export type ReplyCallMessage = ReplyWebRtc;

export interface DestroyFileConnectionMessage extends DefaultMessage {
  content: string;
}

export interface UserProfileChangedMessage extends DefaultMessage, UserDto {

}

export interface ViewUserProfileDto extends UserProfileDto {
  image: string;
}

export interface PingMessage extends DefaultMessage {
  time: string;
}

export interface SetProfileImageMessage extends DefaultMessage {
  content: string;
}

interface ChangeUserOnline extends DefaultMessage, UserDto {
  content: number[];
  time: number;
}

export interface DeleteRoomMessage extends DefaultMessage {
  roomId: number;
}

export type AddOnlineUserMessage = ChangeUserOnline;
export type RemoveOnlineUserMessage = ChangeUserOnline;

interface RoomExistedBefore {
  inviteeUserId: number[];
}

interface NewRoom extends DefaultMessage {
  inviterUserId: number;
  roomId: number;
  time: number;
  users: number[];
}
export interface AddRoomBase extends NewRoom {
  name: string;
  notifications: boolean;
  volume: number;
}

export interface AcceptFileContent {
  received: number;
}

export interface AcceptFileMessage extends DefaultMessage {
  content: AcceptFileContent;
}

export interface AcceptCallMessage extends WebRtcDefaultMessage, OpponentWsId {
}

export interface InviteUserMessage extends NewRoom, RoomExistedBefore {
}
export interface AddInviteMessage extends AddRoomBase, RoomExistedBefore {
}
export type AddRoomMessage = AddRoomBase;

export interface LeaveUserMessage extends DefaultMessage {
  roomId: number;
  userId: number;
  users: number[];
}

export interface LoadMessages extends DefaultMessage {
  content: MessageModelDto[];
  roomId: number;
}

export interface GrowlMessage extends DefaultMessage {
  content: string;
}

export interface DeleteMessage extends DefaultMessage {
  roomId: number;
  id: number;
  edited: number;
}

export interface EditMessage extends DeleteMessage {
  userId: number;
  content: string;
  time: number;
  files: {[id: number]: FileModelDto};
  symbol: string;
  giphy: string;
  deleted: boolean;
}
