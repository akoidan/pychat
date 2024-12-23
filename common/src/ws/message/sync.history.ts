import type {
  DefaultWsOutMessage,
  ResponseWsInMessage,
} from "@common/ws/common";
import {MessageModelDto} from "@common/model/dto/message.model.dto";

export interface SyncHistoryWsOutBody {
  roomIds: number[];
  messagesIds: number[];
  onServerMessageIds: number[];
  receivedMessageIds: number[];
  lastSynced: number;
}
export type SyncHistoryWsOutMessage = DefaultWsOutMessage<"syncHistory", SyncHistoryWsOutBody>;

export interface SyncHistoryWsInBody {
  readMessageIds: number[];
  receivedMessageIds: number[];
  messages: MessageModelDto[];
};

export type SyncHistoryWsInMessage = ResponseWsInMessage<SyncHistoryWsInBody>
