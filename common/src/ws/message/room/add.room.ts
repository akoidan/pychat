import type {DefaultWsInMessage} from "@common/ws/common";
import {AddRoomBase} from "@common/model/ws.base";

export interface AddRoomWsInBody extends AddRoomBase {
  channelUsers: number[];
  channelId: number;
}

export type AddRoomWsInMessage = DefaultWsInMessage<"addRoom", "room", AddRoomWsInBody>;
