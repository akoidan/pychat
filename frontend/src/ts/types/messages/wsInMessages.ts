/**
 * This file should only contain structures created by server. Only BE -> FE by websockets
 * and processed by MessageHandler
 */

import type {
  ChannelDto,
  LocationDto,
  MessageModelDto,
  RoomDto,
  RoomNoUsersDto,
  UserDto,
  UserProfileDto,
  UserProfileDtoWoImage,
  UserSettingsDto,
} from "@/ts/types/dto";

import type {
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
  WebRtcDefaultMessage,
} from "@/ts/types/messages/baseMessagesInterfaces";
import type {MessageStatus} from "@/ts/types/model";

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
  userInfo: UserProfileDto;
  userSettings: UserSettingsDto;
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
