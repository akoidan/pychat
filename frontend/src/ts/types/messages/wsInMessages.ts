/**
 * This file should only contain structures created by server. Only BE -> FE by websockets
 * and processed by MessageHandler
 */

import {
  ChannelDto,
  MessageModelDto,
  RoomDto,
  RoomNoUsersDto,
  UserDto,
  UserProfileDto,
  UserSettingsDto
} from '@/ts/types/dto';

import {
  AcceptFileContent,
  AddRoomBase,
  BrowserBase,
  CallBackMessage,
  ChangeUserOnlineBase,
  DefaultInMessage,
  HandlerName,
  NewRoom,
  OfferFileContent,
  OpponentWsId,
  ReplyWebRtc,
  RoomExistedBefore,
  WebRtcDefaultMessage
} from '@/ts/types/messages/baseMessagesInterfaces';

export interface DefaultWsInMessage<A extends string, H extends HandlerName> extends DefaultInMessage<A, H>, CallBackMessage {
  cbBySender?: string;
  cbId?: number;
}

export interface LoadMessages extends DefaultWsInMessage<'loadMessages', 'channels'> {
  content: MessageModelDto[];
  roomId: number;
}

export interface DeleteMessage extends DefaultWsInMessage<'deleteMessage', 'channels'> {
  roomId: number;
  id: number;
  edited: number;
}

export interface EditMessage extends DefaultWsInMessage<'editMessage', 'channels'> , MessageModelDto  {
}

export interface PrintMessage extends DefaultWsInMessage<'printMessage', 'channels'> , MessageModelDto  {
}

export interface AddOnlineUserMessage extends DefaultWsInMessage<'addOnlineUser', 'channels'>, ChangeUserOnlineBase {
}

export interface RemoveOnlineUserMessage extends DefaultWsInMessage<'removeOnlineUser', 'channels'>, ChangeUserOnlineBase {
}

export interface DeleteRoomMessage extends DefaultWsInMessage<'deleteRoom', 'channels'> {
  roomId: number;
}

export interface LeaveUserMessage extends DefaultWsInMessage<'leaveUser', 'channels'> {
  roomId: number;
  userId: number;
  users: number[];
}

export interface AddChannelMessage extends DefaultWsInMessage<'addChannel', 'channels'> , ChannelDto {
}

export interface InviteUserMessage extends NewRoom, RoomExistedBefore, DefaultWsInMessage<'inviteUser', 'channels'> {
  roomId: number;
  users: number[];
}

export interface AddInviteMessage extends AddRoomBase, RoomExistedBefore, DefaultWsInMessage<'addInvite', 'channels'>  {
}

export interface SaveChannelSettingsMessage extends DefaultWsInMessage<'saveChannelSettings', 'channels'>, ChannelDto {
}

export interface DeleteChannelMessage extends DefaultWsInMessage<'deleteChannel', 'channels'> {
  channelId: number;
}

export interface SaveRoomSettingsMessage extends DefaultWsInMessage<'saveRoomSettings', 'channels'>, RoomNoUsersDto {
}

export interface SetWsIdMessage extends DefaultWsInMessage<'setWsId', 'ws'>, OpponentWsId {
  rooms:  RoomDto[];
  channels: ChannelDto[];
  users: UserDto[];
  online: Record<number, string[]>;
  time: number;
  userImage: string;
  userInfo: UserProfileDto;
  userSettings: UserSettingsDto;
}

export interface WebRtcSetConnectionIdMessage extends WebRtcDefaultMessage, DefaultWsInMessage<'setConnectionId', 'void'> {
  time: number;
}

export interface AddRoomMessage extends AddRoomBase, DefaultWsInMessage<'addRoom', 'channels'> {
}

export interface OfferFile extends WebRtcDefaultMessage, OpponentWsId, DefaultWsInMessage<'offerFile', 'webrtc'> {
  content: OfferFileContent;
  roomId: number;
  userId: number;
  time: number;
}

export interface OfferCall extends WebRtcDefaultMessage, OpponentWsId, DefaultWsInMessage<'offerCall', 'webrtc'> {
  content: BrowserBase;
  roomId: number;
  userId: number;
  time: number;
}

export interface ReplyCallMessage  extends ReplyWebRtc, DefaultWsInMessage<'replyCall', 'webrtcTransfer:*'>  {

}

export interface OfferMessage extends WebRtcDefaultMessage, OpponentWsId, DefaultWsInMessage<'offerMessage', 'webrtc'> {
  content: BrowserBase;
  roomId: number;
  userId: number;
  time: number;
}

export interface SetSettingsMessage extends DefaultWsInMessage<'setSettings', 'ws'> {
  content: UserSettingsDto;
}

export interface SetUserProfileMessage extends DefaultWsInMessage<'setUserProfile', 'ws'> {
  content: UserProfileDto;
}

export interface SetProfileImageMessage extends DefaultWsInMessage<'setProfileImage', 'ws'> {
  content: string;
}

export interface UserProfileChangedMessage extends DefaultWsInMessage<'userProfileChanged', 'ws'>, UserDto {

}

export interface GrowlMessage  {
  content: string;
  action: 'growlError';
}

export interface PingMessage extends DefaultWsInMessage<'ping', 'ws'> {
  time: string;
}

export interface PongMessage extends DefaultWsInMessage<'pong', 'ws'> {
  time: string;
}


export interface ReplyFileMessage extends ReplyWebRtc, DefaultWsInMessage<'replyFile', 'webrtcTransfer:*'> {

}

export interface AcceptCallMessage extends WebRtcDefaultMessage, OpponentWsId, DefaultWsInMessage<'acceptCall', 'webrtcTransfer:*'> {
}
export interface AcceptFileMessage extends DefaultWsInMessage<'acceptFile', 'peerConnection:*'> {
  content: AcceptFileContent;
}

export interface SendRtcDataMessage extends WebRtcDefaultMessage, OpponentWsId, DefaultWsInMessage<'sendRtcData', 'peerConnection:*'> {
  content: RTCSessionDescriptionInit | RTCIceCandidateInit| {message: unknown};
}

export interface RetryFileMessage extends DefaultWsInMessage<'retryFile', 'peerConnection:*'> {
}

export interface DestroyFileConnectionMessage extends DefaultWsInMessage<'destroyFileConnection', 'peerConnection:*'> {
  content: 'decline'|'success';
}
