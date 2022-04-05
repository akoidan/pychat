/**
 * This file should only contain interfaces is used to create Messages to notify.
 * So if you're creating structure that you pass to sub.notify() it should go here.
 * This excludes messages that comes deserialized from websocket or any other network
 */
import type {
  ChannelDto,
  RoomDto,
  UserDto,
} from "@/ts/types/dto";
import type {
  ChangeDeviceType,
  ChangeOnlineType,
  DefaultInMessage,
  HandlerName,
} from "@/ts/types/messages/baseMessagesInterfaces";
import type {MessageStatus} from "@/ts/types/model";


export interface DefaultInnerSystemMessage<A extends string, H extends HandlerName> extends DefaultInMessage<A, H> {
  allowZeroSubscribers?: boolean; // If true, no errors should be present on handeling this message by sucrcription if nothing was notified
}

export interface PubSetRooms extends DefaultInnerSystemMessage<"init", "room"> {
  rooms: RoomDto[];
  channels: ChannelDto[];
  users: UserDto[];
  online: Record<string, string[]>;
}

export type InternetAppearMessage = DefaultInnerSystemMessage<"internetAppear", "*">;

export interface LoginMessage extends DefaultInnerSystemMessage<"login", "router"> {
  session: string;
}

export type LogoutMessage = DefaultInnerSystemMessage<"logout", "*">;

export interface RouterNavigateMessage extends DefaultInnerSystemMessage<"navigate", "router"> {
  to: string;
}

export interface ChangeUserOnlineInfoMessage extends DefaultInnerSystemMessage<"changeOnline", "webrtc"> {
  opponentWsId: string;
  userId: number;
  changeType: ChangeOnlineType;
}

export interface ChangeP2pRoomInfoMessage extends DefaultInnerSystemMessage<"changeDevices", "webrtc"> {
  allowZeroSubscribers: true;
  changeType: ChangeDeviceType;
  roomId: number;
  userId: number | null;
}

export interface ConnectToRemoteMessage extends DefaultInnerSystemMessage<"connectToRemote", HandlerName> {
  stream: MediaStream | null;
}

export interface CheckTransferDestroy extends DefaultInnerSystemMessage<"checkTransferDestroy", "webrtcTransfer:*"> {
  wsOpponentId: string;
}

export interface ChangeStreamMessage extends DefaultInnerSystemMessage<"streamChanged", "peerConnection:*"> {
  newStream: MediaStream;
}

export type DestroyPeerConnectionMessage = DefaultInnerSystemMessage<"destroy", "peerConnection:*">;

export interface SyncP2PMessage extends DefaultInnerSystemMessage<"syncP2pMessage", "peerConnection:*"> {
  id: number;
}

export interface SendSetMessagesStatusMessage extends DefaultInnerSystemMessage<"sendSetMessagesStatus", "peerConnection:*"> {
  messageIds: number[];
  status: MessageStatus;
}
