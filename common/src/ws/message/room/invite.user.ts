import type {DefaultWsInMessage} from "@common/ws/common";
import {
  NewRoom,
  RoomExistedBefore
} from "@common/model/ws.base";

export interface InviteUserWsInBody extends NewRoom, RoomExistedBefore {
  roomId: number;
  users: number[];
}
export type InviteUserWsInMessage = DefaultWsInMessage<"inviteUser", "room", InviteUserWsInBody>;
