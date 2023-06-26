import type {DefaultWsInMessage} from "@common/ws/common";
import {UserDto} from "@common/model/dto/user.dto";

export interface DeleteMessageWsInBody {
  roomId: number;
  id: number;
  edited: number;
}

export type DeleteMessageWsInMessage = DefaultWsInMessage<"deleteMessage", "ws-message", DeleteMessageWsInBody>;
