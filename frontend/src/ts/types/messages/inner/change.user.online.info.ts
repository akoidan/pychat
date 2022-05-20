import {DefaultInnerSystemMessage} from "@/ts/types/messages/helper";


export interface ChangeUserOnlineInfoMessageBody {
  opponentWsId: string;
  userId: number;
  changeType: ChangeOnlineType;
}

export type ChangeUserOnlineInfoMessage = DefaultInnerSystemMessage<"changeOnline", "webrtc", ChangeUserOnlineInfoMessageBody>;
