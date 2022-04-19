import {
  UserOnlineData,
  WebSocketContextData
} from '@/data/types/internal';
import { RemoveOnlineUserMessage } from '@/data/shared/ws.in.messages';

export function getLogoutMessage(online: UserOnlineData, lastTimeOnline: number, context: WebSocketContextData, time: number): RemoveOnlineUserMessage {
  return {
    online,
    action: "removeOnlineUser",
    lastTimeOnline,
    time,
    handler: "room",
    userId: context.userId,
  };
}
