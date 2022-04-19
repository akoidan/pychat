import {
  AcceptFileContent,
  AddRoomBase,
  BrowserBase,
  CallBackMessage,
  ChangeUserOnlineBase,
  ChannelDto,
  GiphyDto, LocationDto,
  MessageModelDto,
  NewRoom,
  OfferFileContent,
  OpponentWsId,
  ReplyWebRtc,
  RoomDto,
  RoomExistedBefore,
  RoomNoUsersDto,
  UserDto,
  UserProfileDto,
  UserProfileDtoWoImage,
  UserSettingsDto,
  WebRtcDefaultMessage
} from '@/data/shared/dto';
import { DefaultMessage, HandlerName } from '@/data/shared/common';
import { MessageStatus } from '@/data/shared/enums';


export interface DefaultInMessage<A extends string, H extends HandlerName> extends DefaultMessage <A> {
  handler: H;
}

export interface GetCountryCodeWsInMessage extends DefaultInMessage<"getCountryCode", "void"> {
  content: Record<string, LocationDto>;
}

export interface DefaultWsInMessage<A extends string, H extends HandlerName> extends DefaultInMessage<A, H>, CallBackMessage {
  cbBySender?: string;
  cbId?: number;
}

export interface ShowITypeWsInMessage extends DefaultWsInMessage<"showIType", "room"> {
  roomId: number;
  userId: number;
}


export interface DeleteMessage extends DefaultWsInMessage<"deleteMessage", "ws-message"> {
  roomId: number;
  id: number;
  edited: number;
}


export interface SetMessageStatusWsInMessage extends DefaultWsInMessage<"setMessageStatus", "ws-message"> {
  roomId: number;
  status: MessageStatus;
  messagesIds: number[];
}

export interface EditMessage extends DefaultWsInMessage<"editMessage", "ws-message">, MessageModelDto {
}

export interface PrintMessageWsInMessage extends DefaultWsInMessage<"printMessage", "ws-message"> {
  message: MessageModelDto;
}

export interface AddOnlineUserMessage extends DefaultWsInMessage<"addOnlineUser", "room">, ChangeUserOnlineBase {
  opponentWsId: string;
}

export interface CreateNewUsedMessage extends DefaultWsInMessage<"createNewUser", "room">, UserDto {
  id: number;
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

export interface GrowlMessage extends DefaultWsInMessage<"growlError", "void"> {
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
