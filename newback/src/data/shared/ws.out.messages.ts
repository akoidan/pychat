import {
  DefaultMessage,
  DefaultWsOutMessage
} from '@/data/types/frontend';


export interface DefaultWsOutMessage<A extends string> extends DefaultMessage<A> {
  cbId?: number;
}

export interface ShowITypeWsOutMessage extends DefaultWsOutMessage<"showIType"> {
  roomId: number;
}

export interface SetMessageStatusWsOutMessage extends DefaultWsOutMessage<"setMessageStatus"> {
  messagesIds: number[];
  status: MessageStatus;
  roomId: number;
}

export type GetCountryCodeWsOutMessage = DefaultWsOutMessage<"getCountryCode">;
