import type {
  UserOnlineData,
  WebSocketContextData,
} from "@/data/types/internal";


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
