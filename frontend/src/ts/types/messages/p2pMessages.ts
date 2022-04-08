/**
 * This file should only contain interfaces is used to exchange structure in P2P rooms
 * So if we create a structure on one PC (on frontend) and handle on another (on frontend as well)
 * this file should do it
 */
import type {
  CallBackMessage,
  DefaultMessage,
  ResolveCallbackId,
} from "@/ts/types/messages/baseMessagesInterfaces";
import type {
  MessageP2pDto,
  MessagesInfo,
} from "@/ts/types/messages/p2pDto";
import type {MessageStatus} from "@/ts/types/model";


export type P2PHandlerType<A extends string> = (a: DefaultP2pMessage<A>) => Promise<void> | void;

export type P2PHandlerTypes<K extends string> = {
  [Key in K]?: P2PHandlerType<Key>
};

export interface DefaultP2pMessage<A extends string> extends DefaultMessage<A>, ResolveCallbackId {

}


export interface ExchangeMessageInfoResponse3 extends DefaultP2pMessage<"exchangeMessageInfoResponse3">, CallBackMessage {
}

export interface SetMessageStatusRequest extends DefaultP2pMessage<"setMessageStatus">, CallBackMessage {
  status: MessageStatus;
  messagesIds: number[];
}

export type ConfirmSetMessageStatusRequest = DefaultP2pMessage<"confirmSetMessageStatusRequest">;

export interface ExchangeMessageInfoResponse extends DefaultP2pMessage<"exchangeMessageInfoResponse">, CallBackMessage {
  messages: MessageP2pDto[];
  requestMessages: number[];
}

export interface ExchangeMessageInfoResponse2 extends DefaultP2pMessage<"exchangeMessageInfoResponse2">, CallBackMessage {
  messages: MessageP2pDto[];
}

export interface ExchangeMessageInfoRequest extends DefaultP2pMessage<"exchangeMessageInfoRequest">, CallBackMessage {
  messagesInfo: MessagesInfo;
}

export interface SendNewP2PMessage extends DefaultP2pMessage<"sendNewP2PMessage">, CallBackMessage {
  message: MessageP2pDto;
}

export interface ConfirmReceivedP2pMessage extends DefaultP2pMessage<"confirmReceivedP2pMessage"> {
  status?: MessageStatus;
}
