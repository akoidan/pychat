import type {DefaultInnerSystemMessage} from "@/ts/types/messages/helper";
import type {MessageStatus} from "@common/model/enum/message.status";

export interface SendSetMessagesStatusInnerSystemBody {
  messageIds: number[];
  status: MessageStatus;
}

export interface SendSetMessagesStatusInnerSystemMessage extends DefaultInnerSystemMessage<"sendSetMessagesStatus", "peerConnection:*", SendSetMessagesStatusInnerSystemBody> {
  allowZeroSubscribers: true;
}
