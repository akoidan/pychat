import type {UserModel} from "@/data/model/user.model";


export function transformAddUserOnline(online: Record<number, string[]>, user: UserModel, opponentWsId: string): AddOnlineUserMessage {
  return {
    action: "addOnlineUser",
    handler: "room",
    online,
    userId: user.id,
    lastTimeOnline: user.lastTimeOnline,
    time: Date.now(),
    opponentWsId,
  };
}
