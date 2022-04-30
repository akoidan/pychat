import type {
  DefaultWsInMessage,
  DefaultWsOutMessage,
} from "@common/ws/common";
import type {MessageStatus} from "@common/model/enum/message.status";

export interface SetMessageStatusWsOutBody  {
  messagesIds: number[];
  status: MessageStatus;
  roomId: number;
}

export type SetMessageStatusWsOutMessage = DefaultWsOutMessage<"setMessageStatus", SetMessageStatusWsOutBody>;

export interface SetMessageStatusWsInBody {
  roomId: number;
  status: MessageStatus;
  messagesIds: number[];
}

export type SetMessageStatusWsInMessage = DefaultWsInMessage<"setMessageStatus", "ws-message",SetMessageStatusWsInBody>;
