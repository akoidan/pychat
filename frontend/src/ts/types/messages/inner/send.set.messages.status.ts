import type {DefaultInnerSystemMessage} from "@/ts/types/messages/helper";
import type {MessageStatusModel} from "@/ts/types/model";

export interface SendSetMessagesStatusMessageBody {
  messageIds: number[];
  status: MessageStatusModel;
}
export type SendSetMessagesStatusMessage = DefaultInnerSystemMessage<"sendSetMessagesStatus", "peerConnection:*", SendSetMessagesStatusMessageBody>;
