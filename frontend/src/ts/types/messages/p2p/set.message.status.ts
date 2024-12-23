import {MessageStatus} from "@common/model/enum/message.status";
import {DefaultRequestP2pMessage} from "@/ts/types/messages/p2p";

export interface SetMessageStatusP2pBody {
  status: MessageStatus;
  messagesIds: number[];
}
export type SetMessageStatusP2pMessage = DefaultRequestP2pMessage<"setMessageStatus", SetMessageStatusP2pBody>;
