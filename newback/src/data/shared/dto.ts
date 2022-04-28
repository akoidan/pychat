import type {
  Gender,
  ImageType,
  MessageStatus,
} from "./enums";
import type {DefaultInMessage} from "./ws.in.messages";
import type {
  HandlerName,
  HandlerType,
} from "./common";


export declare type LogLevel =
  "debug"
  | "disable"
  | "error"
  | "info"
  | "log_raise_error"
  | "log_with_warnings"
  | "trace"
  | "warn";


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
  handle(message: DefaultInMessage<string, HandlerName>): void;

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  getHandler<H extends HandlerName, A extends string>(message: DefaultInMessage<A, H>): HandlerType<A, H> | undefined;
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


