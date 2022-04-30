import type {
  UserOnlineData,
  WebSocketContextData,
} from "@/data/types/internal";
import type {RemoveOnlineUserMessage} from "@common/legacy";


export function getLogoutMessage(online: UserOnlineData, lastTimeOnline: number, context: WebSocketContextData, time: number): RemoveOnlineUserMessage {
  return {
    data: {
      online,
      lastTimeOnline,
      time,
      userId: context.userId,
    },
    action: "removeOnlineUser",
    handler: "room",
  };
}
