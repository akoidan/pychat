import type {
  DefaultWsInMessage,
  HandlerName,
  HandlerType,
} from "@common/ws/common";
import type {UserDto} from "@common/model/dto/user.dto";
import type {ChannelDto} from "@common/model/dto/channel.dto";
import type {MessageModelDto} from "@common/model/dto/message.model.dto";
import type {
  RoomDto,
  RoomNoUsersDto,
} from "@common/model/dto/room.dto";
import type {
  UserProfileDto,
  UserProfileDtoWoImage,
} from "@common/model/dto/user.profile.dto";
import type {UserSettingsDto} from "@common/model/dto/user.settings.dto";


export interface ChangeUserOnlineBase {
  online: Record<number, string[]>;
  userId: number;
  lastTimeOnline: number;
  time: number;
}


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


export interface ResolveCallbackId {
  resolveCbId?: number; // If this callback id is present, resolve it
}

export interface IMessageHandler {
  handle<H extends HandlerName>(message: DefaultWsInMessage<string, H, HandlerName>): void;

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  getHandler<H extends HandlerName, A extends string>(message: DefaultWsInMessage<A, H, any>): HandlerType<A, H, any> | undefined;
}

export type CallStatus =
  "accepted"
  | "not_inited"
  | "received_offer"
  | "sent_offer";


/** WsInMessages.ts */
/**
 * This file should only contain structures created by server. Only BE -> FE by websockets
 * and processed by MessageHandler
 */


export interface MessagesResponseMessage {
  content: MessageModelDto[];
}


export interface AddOnlineUserBodyMessage extends ChangeUserOnlineBase {
  opponentWsId: string;
}
export type AddOnlineUserMessage = DefaultWsInMessage<"addOnlineUser", "room", AddOnlineUserBodyMessage>;


// Export type EditMessage = DefaultWsInMessage<"editMessage", "ws-message", MessageModelDto>;


export type DeleteMessage = DefaultWsInMessage<"deleteMessage", "ws-message", {
  roomId: number;
  id: number;
  edited: number;
}>;


export interface CreateNewUserBodyMessage extends UserDto {
  rooms: {
    roomId: number;
    users: number[];
  }[];
}

export type CreateNewUsedMessage = DefaultWsInMessage<"createNewUser", "room", CreateNewUserBodyMessage>;

export type RemoveOnlineUserMessage = DefaultWsInMessage<"removeOnlineUser", "room", ChangeUserOnlineBase>;


export type DeleteRoomMessage = DefaultWsInMessage<"deleteRoom", "room", {
  roomId: number;
}>;


export type LeaveUserMessage = DefaultWsInMessage<"leaveUser", "room", {
  roomId: number;
  userId: number;
  users: number[];
}>;

export interface AddChannelMessageBody extends ChannelDto, Omit<RoomDto, "channelId">, NewRoom {
  channelUsers: number[];
}
export type AddChannelMessage = DefaultWsInMessage<"addChannel", "room", AddChannelMessageBody>;

export interface InviteUserMessageBody extends NewRoom, RoomExistedBefore {
  roomId: number;
  users: number[];
}
export type InviteUserMessage = DefaultWsInMessage<"inviteUser", "room", InviteUserMessageBody>;


export type AddInviteMessage = DefaultWsInMessage<"addInvite", "room", AddRoomBase | RoomExistedBefore | {
} >;

export type SaveChannelSettingsMessage = DefaultWsInMessage<"saveChannelSettings", "room", ChannelDto | {
  notifications: boolean;
  volume: number;
  p2p: boolean;
  userId: number;
}>;

export type DeleteChannelMessage = DefaultWsInMessage<"deleteChannel", "room", {
  channelId: number;
  roomIds: number[];
}>;

export type SaveRoomSettingsMessage = DefaultWsInMessage<"saveRoomSettings", "room", RoomNoUsersDto | {

}>;



export type WebRtcSetConnectionIdMessage = DefaultWsInMessage<"setConnectionId", "void", WebRtcDefaultMessage | {
  time: number;
}>;

export type AddRoomMessage = DefaultWsInMessage<"addRoom", "room", AddRoomBase | {
  channelUsers: number[];
  channelId: number;
}>;

export type OfferFile = DefaultWsInMessage<"offerFile", "webrtc", OpponentWsId | WebRtcDefaultMessage | {
  content: OfferFileContent;
  roomId: number;
  threadId: number | null;
  userId: number;
  time: number;
}>;

export type OfferCall = DefaultWsInMessage<"offerCall", "webrtc", OpponentWsId | WebRtcDefaultMessage | {
  content: BrowserBase;
  roomId: number;
  userId: number;
  time: number;
}>;

export type ReplyCallMessage = DefaultWsInMessage<"replyCall", "webrtcTransfer:*", ReplyWebRtc>;

export type NotifyCallActiveMessage = DefaultWsInMessage<"notifyCallActive", "webrtc", OpponentWsId | WebRtcDefaultMessage | {
  roomId: number;
  userId: number;
}>;

export type DestroyCallConnection = DefaultWsInMessage<"destroyCallConnection", "peerConnection:*", OpponentWsId | WebRtcDefaultMessage | {
  content: string;
}>;

export type OfferMessage = DefaultWsInMessage<"offerMessage", "webrtc", OpponentWsId | WebRtcDefaultMessage | {
  content: BrowserBase;
  roomId: number;
  userId: number;
  time: number;
}>;

export type SetSettingsMessage = DefaultWsInMessage<"setSettings", "ws", UserSettingsDto>;

export type SetUserProfileMessage = DefaultWsInMessage<"setUserProfile", "ws", UserProfileDtoWoImage>;

export type UserProfileChangedMessage = DefaultWsInMessage<"userProfileChanged", "ws", UserDto>;



export type PingMessage = DefaultWsInMessage<"ping", "ws", {
  time: string;
}>;

export type PongMessage = DefaultWsInMessage<"pong", "ws", {
  time: string;
}>;

export type ReplyFileMessage = DefaultWsInMessage<"replyFile", "webrtcTransfer:*", ReplyWebRtc>;

export type SetProfileImageMessage = DefaultWsInMessage<"setProfileImage", "ws", string>;

export type AcceptCallMessage = DefaultWsInMessage<"acceptCall", "webrtcTransfer:*", OpponentWsId | WebRtcDefaultMessage>;

export type AcceptFileMessage = DefaultWsInMessage<"acceptFile", "peerConnection:*", AcceptFileContent>;

export type SendRtcDataMessage = DefaultWsInMessage<"sendRtcData", "peerConnection:*", OpponentWsId | WebRtcDefaultMessage | {
  content: RTCIceCandidateInit | RTCSessionDescriptionInit | {message: unknown};
}>;

export type RetryFileMessage = DefaultWsInMessage<"retryFile", "peerConnection:*", {}>;

export type DestroyFileConnectionMessage = DefaultWsInMessage<"destroyFileConnection", "peerConnection:*", "decline" | "success">;

