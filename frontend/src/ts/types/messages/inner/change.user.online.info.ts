import {DefaultInnerSystemMessage} from "@/ts/types/messages/helper";
import {ChangeOnlineType} from "@common/legacy";

export interface ChangeUserOnlineInfoMessageBody {
  opponentWsId: string;
  userId: number;
  changeType: ChangeOnlineType;
}

export type ChangeUserOnlineInfoMessage = DefaultInnerSystemMessage<"changeOnline", "webrtc", ChangeUserOnlineInfoMessageBody>;
