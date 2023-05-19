import type {DefaultInnerSystemMessage} from "@/ts/types/messages/helper";

export interface CheckTransferDestroyBody {
  wsOpponentId: string;
}
export type CheckTransferDestroyMessage = DefaultInnerSystemMessage<"checkTransferDestroy", "webrtcTransfer:*", CheckTransferDestroyBody>;
