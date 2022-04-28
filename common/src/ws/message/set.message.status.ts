import {
  DefaultWsInMessage,
  DefaultWsOutMessage
} from '@common/ws/common';
import {MessageStatus} from '@common/model/enum/message.status';

export type SetMessageStatusWsOutMessage = DefaultWsOutMessage<"setMessageStatus", {
  messagesIds: number[];
  status: MessageStatus;
  roomId: number;
}>;

export type SetMessageStatusWsInMessage = DefaultWsInMessage<"setMessageStatus", "ws-message", {
  roomId: number;
  status: MessageStatus;
  messagesIds: number[];
}>;
