import type {
  UserOnlineData,
} from "@/data/types/internal";
import type {RemoveOnlineUserWsInMessage} from "@common/ws/message/room/remove.online.user";
import {WebSocketContextData} from "@/data/types/patch";


export function getLogoutMessage(online: UserOnlineData, lastTimeOnline: number, context: WebSocketContextData, time: number): RemoveOnlineUserWsInMessage {
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
