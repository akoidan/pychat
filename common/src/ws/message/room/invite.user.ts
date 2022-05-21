import type {DefaultWsInMessage} from "@common/ws/common";
import {
  NewRoom,
  RoomExistedBefore
} from "@common/model/ws.base";

export interface InviteUserBody extends NewRoom, RoomExistedBefore {
  roomId: number;
  users: number[];
}
export type InviteUserMessage = DefaultWsInMessage<"inviteUser", "room", InviteUserBody>;
