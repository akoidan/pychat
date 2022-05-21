import type {DefaultWsInMessage} from "@common/ws/common";
import {
  AddRoomBase,
  RoomExistedBefore
} from "@common/model/ws.base";

export type AddInviteBody = AddRoomBase | RoomExistedBefore;

export type AddInviteMessage = DefaultWsInMessage<"addInvite", "room", AddInviteBody>;
