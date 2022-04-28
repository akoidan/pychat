import type {
  ChangeUserOnlineBase,
  ChannelDto,
  MessageModelDto,
  RoomDto,
} from "./dto";


interface AddOnlineUserBodyMessage extends ChangeUserOnlineBase {
  opponentWsId: string;
}
export type AddOnlineUserMessage = DefaultWsInMessage<"addOnlineUser", "room", AddOnlineUserBodyMessage>;


// Export type EditMessage = DefaultWsInMessage<"editMessage", "ws-message", MessageModelDto>;

/*
 * Export type DeleteMessage = DefaultWsInMessage<"deleteMessage", "ws-message", {
 *   roomId: number;
 *   id: number;
 *   edited: number;
 * }>;
 */
/*
 * Export interface CreateNewUserBodyMessage extends UserDto {
 *   rooms: {
 *     roomId: number;
 *     users: number[];
 *   }[];
 * }
 *
 * export type CreateNewUsedMessage = DefaultWsInMessage<"createNewUser", "room", CreateNewUserBodyMessage>;
 *
 * export type RemoveOnlineUserMessage = DefaultWsInMessage<"removeOnlineUser", "room", ChangeUserOnlineBase>;
 *
 *
 * export type DeleteRoomMessage = DefaultWsInMessage<"deleteRoom", "room", {
 *   roomId: number;
 * }>;
 *
 *
 * export type LeaveUserMessage = DefaultWsInMessage<"leaveUser", "room", {
 *   roomId: number;
 *   userId: number;
 *   users: number[];
 * }>;
 *
 * export interface AddChannelMessageBody extends ChannelDto, Omit<RoomDto, "channelId">, NewRoom {
 *   channelUsers: number[];
 * }
 * export type AddChannelMessage = DefaultWsInMessage<"addChannel", "room", AddChannelMessageBody>;
 *
 * export interface InviteUserMessageBody extends NewRoom, RoomExistedBefore {
 *   roomId: number;
 *   users: number[];
 * }
 * export type InviteUserMessage = DefaultWsInMessage<"inviteUser", "room", InviteUserMessageBody>;
 */

/*
 *
 * Export type AddInviteMessage = AddRoomBase, RoomExistedBefore, DefaultWsInMessage<"addInvite", "room"> {
 * }
 *
 * export type SaveChannelSettingsMessage = DefaultWsInMessage<"saveChannelSettings", "room">, ChannelDto {
 *   notifications: boolean;
 *   volume: number;
 *   p2p: boolean;
 *   userId: number;
 * }
 *
 * export type DeleteChannelMessage = DefaultWsInMessage<"deleteChannel", "room"> {
 *   channelId: number;
 *   roomIds: number[];
 * }
 *
 * export type SaveRoomSettingsMessage = DefaultWsInMessage<"saveRoomSettings", "room">, RoomNoUsersDto {
 * }
 *
 *
 * export type SetWsIdMessage = DefaultWsInMessage<"setWsId", "ws">, OpponentWsId {
 *   rooms: RoomDto[];
 *   channels: ChannelDto[];
 *   users: UserDto[];
 *   online: Record<number, string[]>;
 *   time: number;
 *   profile: UserProfileDto;
 *   settings: UserSettingsDto;
 * }
 *
 * export type WebRtcSetConnectionIdMessage = WebRtcDefaultMessage, DefaultWsInMessage<"setConnectionId", "void"> {
 *   time: number;
 * }
 *
 * export type AddRoomMessage = AddRoomBase, DefaultWsInMessage<"addRoom", "room"> {
 *   channelUsers: number[];
 *   channelId: number;
 * }
 *
 * export type OfferFile = WebRtcDefaultMessage, OpponentWsId, DefaultWsInMessage<"offerFile", "webrtc"> {
 *   content: OfferFileContent;
 *   roomId: number;
 *   threadId: number | null;
 *   userId: number;
 *   time: number;
 * }
 *
 * export type OfferCall = WebRtcDefaultMessage, OpponentWsId, DefaultWsInMessage<"offerCall", "webrtc"> {
 *   content: BrowserBase;
 *   roomId: number;
 *   userId: number;
 *   time: number;
 * }
 *
 * export type ReplyCallMessage = ReplyWebRtc, DefaultWsInMessage<"replyCall", "webrtcTransfer:*"> {
 *
 * }
 *
 * export type NotifyCallActiveMessage = DefaultWsInMessage<"notifyCallActive", "webrtc">, WebRtcDefaultMessage, OpponentWsId {
 *   roomId: number;
 *   userId: number;
 * }
 *
 * export type DestroyCallConnection = WebRtcDefaultMessage, OpponentWsId, DefaultWsInMessage<"destroyCallConnection", "peerConnection:*"> {
 *   content: string;
 * }
 *
 * export type OfferMessage = WebRtcDefaultMessage, OpponentWsId, DefaultWsInMessage<"offerMessage", "webrtc"> {
 *   content: BrowserBase;
 *   roomId: number;
 *   userId: number;
 *   time: number;
 * }
 *
 * export type SetSettingsMessage = DefaultWsInMessage<"setSettings", "ws"> {
 *   content: UserSettingsDto;
 * }
 *
 * export type SetUserProfileMessage = DefaultWsInMessage<"setUserProfile", "ws"> {
 *   content: UserProfileDtoWoImage;
 * }
 *
 * export type UserProfileChangedMessage = DefaultWsInMessage<"userProfileChanged", "ws">, UserDto {
 *
 * }
 *
 * export type GrowlMessage = DefaultWsInMessage<"growlError", "void"> {
 *   content: string;
 *   action: "growlError";
 * }
 *
 * export type PingMessage = DefaultWsInMessage<"ping", "ws"> {
 *   time: string;
 * }
 *
 * export type PongMessage = DefaultWsInMessage<"pong", "ws"> {
 *   time: string;
 * }
 *
 * export type ReplyFileMessage = ReplyWebRtc, DefaultWsInMessage<"replyFile", "webrtcTransfer:*"> {
 *
 * }
 *
 * export type SetProfileImageMessage = DefaultWsInMessage<"setProfileImage", "ws"> {
 *   content: string;
 * }
 *
 * export type AcceptCallMessage = WebRtcDefaultMessage, OpponentWsId, DefaultWsInMessage<"acceptCall", "webrtcTransfer:*"> {
 * }
 *
 * export type AcceptFileMessage = DefaultWsInMessage<"acceptFile", "peerConnection:*"> {
 *   content: AcceptFileContent;
 * }
 *
 * export type SendRtcDataMessage = WebRtcDefaultMessage, OpponentWsId, DefaultWsInMessage<"sendRtcData", "peerConnection:*"> {
 *   content: RTCIceCandidateInit | RTCSessionDescriptionInit | {message: unknown};
 * }
 *
 * export type RetryFileMessage = DefaultWsInMessage<"retryFile", "peerConnection:*">;
 *
 * export type DestroyFileConnectionMessage = DefaultWsInMessage<"destroyFileConnection", "peerConnection:*"> {
 *   content: "decline" | "success";
 * }
 */
