import { DefaultMessage } from '@/data/shared/common';
import { MessageStatus } from '@/data/shared/enums';
import { GiphyDto } from '@/data/shared/dto';


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

export interface SyncHistoryWsOutMessage extends DefaultWsOutMessage<"syncHistory"> {
  roomIds: number[];
  messagesIds: number[];
  onServerMessageIds: number[];
  receivedMessageIds: number[];
  lastSynced: number;
}

export interface PrintMessageWsOutMessage extends DefaultMessage<"printMessage"> {
  content: string;
  roomId: number;
  files: number[];
  id: number;
  timeDiff: number;
  parentMessage: number | null;
  tags: Record<string, number>;
  giphies: GiphyDto[];
}
