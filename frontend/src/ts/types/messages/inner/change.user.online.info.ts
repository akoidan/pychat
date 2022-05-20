import type {ChangeOnlineType} from "@common/model/ws.base";


import type {DefaultInnerSystemMessage} from "@/ts/types/messages/helper";
import type {ChangeOnlineType} from "@common/legacy";

export interface ChangeUserOnlineInfoMessageBody {
  opponentWsId: string;
  userId: number;
  changeType: ChangeOnlineType;
}

export type ChangeUserOnlineInfoMessage = DefaultInnerSystemMessage<"changeOnline", "webrtc", ChangeUserOnlineInfoMessageBody>;
