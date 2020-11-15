import {
  ChannelDto,
  MessageModelDto,
  RoomDto,
  RoomNoUsersDto,
  UserDto,
  UserProfileDto,
  UserSettingsDto,
  WebRtcMessageModelDto
} from '@/ts/types/dto';
import { UploadFile } from "@/ts/types/types";

export interface DefaultSentMessage {
  action: string;
  messageId?: number;
}


// any means that every every registered subscriber will be called with this handler if it exists
// this means, that handler that registered this event will be called
// void means that no handlers should process this signal

export type HandlerName = 'router' | 'channels' | 'lan' | 'message' | 'webrtc' | 'ws'| 'void' |'this' | 'any';

export interface DefaultMessage extends DefaultSentMessage {
  handler: HandlerName;
  cbBySender?: string;
  allowZeroSubscribers?: boolean; // if true, no errors should be present on handeling this message by sucrcription if nothing was notified
}

export interface LoginMessage extends DefaultMessage {
  session: string;
}

export interface LogoutMessage extends DefaultMessage {
}

export interface RouterNavigateMessage extends DefaultMessage {
  to: string;
}

export interface SaveChannelSettings extends DefaultMessage, ChannelDto {
}

export interface SaveRoomSettings extends DefaultMessage, RoomNoUsersDto {
}

export interface DeleteChannel extends DefaultMessage {
  channelId: number;
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
  rooms:  RoomDto[];
  channels: ChannelDto[];
  users: UserDto[];
  online: Record<number, string[]>;
  time: number;
  userImage: string;
  userInfo: UserProfileDto;
  userSettings: UserSettingsDto;
}

export interface InnerSendMessage extends DefaultMessage {
  content: string;
  id: number;
  uploadFiles: UploadFile[];
  originId: number;
  originTime: number;
}

export interface ConnectToRemoteMessage extends DefaultMessage  {
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

export type CallStatus = 'not_inited'|'sent_offer'| 'received_offer' | 'accepted';

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

export interface ReplyFileMessage extends ReplyWebRtc {

}

export interface ReplyCallMessage  extends ReplyWebRtc {

}

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
  content: Record<number, string[]>;
  time: number;
}

export interface DeleteRoomMessage extends DefaultMessage {
  roomId: number;
}

export interface AddOnlineUserMessage extends ChangeUserOnline {}
export interface RemoveOnlineUserMessage extends ChangeUserOnline {}

interface RoomExistedBefore {
  inviteeUserId: number[];
}

interface NewRoom extends DefaultMessage {
  inviterUserId: number;
  time: number;
}

export interface AddRoomBase extends NewRoom,  Omit<ChannelDto, 'channelId'>, RoomDto {
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
  roomId: number;
  users: number[];
}

export interface AddInviteMessage extends AddRoomBase, RoomExistedBefore {
}

export interface AddRoomMessage extends AddRoomBase {
}

export interface AddChannelMessage extends DefaultMessage , ChannelDto {
}

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

export interface PrintWebRtcMessage extends DefaultMessage, WebRtcMessageModelDto {

}

export interface PrintMessage extends DefaultMessage, MessageModelDto {
}

export interface EditMessage extends DefaultMessage, MessageModelDto  {
}
