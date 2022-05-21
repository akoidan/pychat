import type {DefaultWsInMessage} from "@common/ws/common";
import {
  AddRoomBase,
  RoomExistedBefore
} from "@common/model/ws.base";

export type AddInviteWsInBody = AddRoomBase | RoomExistedBefore;

export type AddInviteWsInMessage = DefaultWsInMessage<"addInvite", "room", AddInviteWsInBody>;
