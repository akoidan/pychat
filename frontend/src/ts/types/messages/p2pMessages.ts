/**
 * This file should only contain interfaces is used to exchange structure in P2P rooms
 * So if we create a structure on one PC (on frontend) and handle on another (on frontend as well)
 * this file should do it
 */
import { WebRtcMessageModelDto } from '@/ts/types/dto';
import {
  CallBackMessage,
  DefaultMessage,
} from '@/ts/types/messages/baseMessagesInterfaces';
import {
  MessageP2pDto,
  MessagesInfo
} from '@/ts/types/messages/p2pDto';


export type P2PHandlerType<A extends string> = (a: DefaultP2pMessage<A>) => void|Promise<void>;

export type P2PHandlerTypes<K extends string> = {
  [Key in K]?: P2PHandlerType<Key>
};

export interface DefaultP2pMessage<A extends string> extends DefaultMessage<A>  {
  cbId?: number; // request to send response with this callback id
  resolveCbId?: number; // if this callback id is present, resolve it
}


export interface ExchangeMessageInfoResponse extends DefaultP2pMessage<'exchangeMessageInfoRequest'>, CallBackMessage {
  messages: MessageP2pDto[];
  requestMessages: number[];
}

export interface ExchangeMessageInfoResponseToResponse extends DefaultP2pMessage<'exchangeMessageInfoResponseToResponse'>, CallBackMessage {
  messages: MessageP2pDto[];
}

export interface ExchangeMessageInfoRequest extends DefaultP2pMessage<'exchangeMessageInfoRequest'> {
  messagesInfo: MessagesInfo;
}

export interface SendNewP2PMessage extends DefaultP2pMessage<'sendNewP2PMessage'> {
  message: MessageP2pDto;
}

export interface ConfirmReceivedP2pMessage extends DefaultP2pMessage<'confirmReceivedP2pMessage'> {
}