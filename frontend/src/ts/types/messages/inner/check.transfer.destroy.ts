import type {DefaultInnerSystemMessage} from "@/ts/types/messages/helper";

export interface CheckTransferDestroyMessageBody {
  wsOpponentId: string;
}
export type CheckTransferDestroyMessage = DefaultInnerSystemMessage<"checkTransferDestroy", "webrtcTransfer:*", CheckTransferDestroyMessageBody>;

