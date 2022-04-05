/**
 * This file should only contain interfaces that is used in this package (messages) by other interfaces
 */
import type {
  ChannelDto,
  RoomDto,
} from "@/ts/types/dto";


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
