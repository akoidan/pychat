/**
 * This file only contains messages that sent to backend api. FE -> BE by websockets
 */

import {
  DefaultMessage
} from '@/ts/types/messages/baseMessagesInterfaces';

export interface DefaultWsOutMessage<A extends string> extends DefaultMessage<A> {
  cbId?: number;
}

export interface SyncHistoryOutContent {
  roomId: number;
  messagesIds: Record<string, number|null>;
}

export interface SyncHistoryOutMessage extends DefaultWsOutMessage<'syncHistory'>{
  content: SyncHistoryOutContent[];
  lastSynced: number;
}
