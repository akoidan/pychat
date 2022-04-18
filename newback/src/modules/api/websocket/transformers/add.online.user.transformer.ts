import {UserModel} from '@/data/model/user.model';
import {AddOnlineUserMessage} from '@/data/types/frontend';

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
