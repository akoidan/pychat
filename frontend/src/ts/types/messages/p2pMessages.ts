/**
 * This file should only contain interfaces is used to exchange structure in P2P rooms
 * So if we create a structure on one PC (on frontend) and handle on another (on frontend as well)
 * this file should do it
 */
import type {MessageStatus} from "@common/model/enum/message.status";

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

export interface ExchangeMessageInfoResponse3 extends DefaultP2pMessage<"exchangeMessageInfoResponse3">, CallBackMessage {
}
