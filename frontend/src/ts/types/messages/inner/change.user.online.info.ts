import type {ChangeOnlineType} from "@common/model/ws.base";


import type {DefaultInnerSystemMessage} from "@/ts/types/messages/helper";

export interface ChangeOnlineBody {
  opponentWsId: string;
  userId: number;
  changeType: ChangeOnlineType;
}

export type ChangeOnlineMessage = DefaultInnerSystemMessage<"changeOnline", "webrtc", ChangeOnlineBody>;
