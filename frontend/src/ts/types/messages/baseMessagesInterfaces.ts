/**
 * This file should only contain interfaces that is used in this package (messages) by other interfaces
 */
import {
  ChannelDto,
  RoomDto,
  UserDto
} from '@/ts/types/dto';
import { DefaultWsInMessage } from '@/ts/types/messages/wsInMessages';


export interface ChangeUserOnlineBase {
  content: Record<number, string[]>;
  userId: number;
  lastTimeOnline: number;
  time: number;
}

// any means that every every registered subscriber will be called with this handler if it exists
// this means, that handler that registered this event will be called
// void means that no handlers should process this signal
export type HandlerName = 'router' | 'ws-message' | 'webrtc-message' |'room' | 'webrtc' | 'ws'| 'void' | 'any' | 'call' | 'webrtcTransfer:*' | 'peerConnection:*' | 'notifier';
export type CallHandlerName = HandlerName | 'dummyCall';

export type HandlerType<A extends string, H extends HandlerName> = (a: DefaultInMessage<A, H | 'any'>) => void|Promise<void>;

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

export interface AddRoomBase extends NewRoom,  Omit<ChannelDto, 'channelId'>, RoomDto {
}

export interface OpponentWsId {
  opponentWsId: string;
}

export interface WebRtcDefaultMessage  {
  connId: string;
}

export interface OfferFileContent extends BrowserBase {
  size: number;
  name: string;
}
export type ChangeDeviceType = 'someone_left'| 'room_created' | 'i_deleted' | 'someone_joined' | 'invited';
export type ChangeOnlineType = 'appear_online' | 'gone_offline';

export interface BrowserBase {
  browser: string;
}

export interface CallBackMessage {
  // request to send response with this callback id
  cbId?: number;
}

export interface DefaultMessage<A extends string> {
  action: A;
}

export interface DefaultInMessage<A extends string, H extends HandlerName> extends DefaultMessage <A> {
  handler: H;
}

export interface  ResolveCallbackId {
  resolveCbId?: number; // if this callback id is present, resolve it
}

export interface IMessageHandler {
  handle(message: DefaultInMessage<string, HandlerName>): void;
  getHandler<H extends HandlerName, A extends string>(message: DefaultInMessage<A, H>): HandlerType<A, H>|undefined;
}
export type CallStatus = 'not_inited'|'sent_offer'| 'received_offer' | 'accepted';
