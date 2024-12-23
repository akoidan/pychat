import {MessageStatus} from "@common/model/enum/message.status";
import {
  DefaultP2pMessage,
  DefaultRequestP2pMessage,
  DefaultRequestResponseP2pMessage
} from "@/ts/types/messages/p2p";
import {MessagesInfo} from "@/ts/types/messages/p2pDto";

export interface SetMessageStatusP2pBody {
  status: MessageStatus;
  messagesIds: number[];
}

export interface ExchangeMessageInfo1P2pBody {
  messagesInfo: MessagesInfo;
}

export interface ExchangeMessageInfo2P2pBody {
  messagesInfo: MessagesInfo;
}

export type ExchangeMessageInfo1RequestP2pMessage = DefaultRequestP2pMessage<"exchangeMessageInfo", ExchangeMessageInfo1P2pBody>;

export type ExchangeMessageInfo2 = DefaultRequestResponseP2pMessage<>;
