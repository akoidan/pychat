import {
  UserOnlineData,
  WebSocketContextData
} from '@/data/types/internal';
import {RemoveOnlineUserMessage} from '@/data/types/frontend';

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
