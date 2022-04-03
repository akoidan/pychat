/**
 * This file only contains messages that sent to backend api. FE -> BE by websockets
 */

import type {DefaultMessage} from "@/ts/types/messages/baseMessagesInterfaces";

export interface DefaultWsOutMessage<A extends string> extends DefaultMessage<A> {
  cbId?: number;
}

export interface SyncHistoryOutMessage extends DefaultWsOutMessage<"syncHistory"> {
  roomIds: number[];
  messagesIds: number[];
  onServerMessageIds: number[];
  receivedMessageIds: number[];
  lastSynced: number;
}
