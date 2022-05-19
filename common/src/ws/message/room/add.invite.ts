import type {DefaultWsInMessage} from "@common/ws/common";
import {
  AddRoomBase,
  NewRoom,
  RoomExistedBefore
} from "@common/legacy";

export type AddInviteBody = AddRoomBase | RoomExistedBefore;

export type AddInviteMessage = DefaultWsInMessage<"addInvite", "room", AddInviteBody>;
