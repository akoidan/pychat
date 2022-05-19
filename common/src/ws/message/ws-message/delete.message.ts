import type {DefaultWsInMessage} from "@common/ws/common";
import {UserDto} from "@common/model/dto/user.dto";

export interface DeleteMessageBody {
  roomId: number;
  id: number;
  edited: number;
}

export type DeleteMessage = DefaultWsInMessage<"deleteMessage", "ws-message", DeleteMessageBody>;
