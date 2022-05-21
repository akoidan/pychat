import type {UserModel} from "@/data/model/user.model";
import type {AddOnlineUserMessage} from "@common/ws/message/room/add.online.user";

export function transformAddUserOnline(online: Record<number, string[]>, user: UserModel, opponentWsId: string): AddOnlineUserMessage {
  return {
    action: "addOnlineUser",
    handler: "room",
    data: {
      online,
      userId: user.id,
      lastTimeOnline: user.lastTimeOnline,
      time: Date.now(),
      opponentWsId,
    },
  };
}
