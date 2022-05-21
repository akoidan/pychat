import type {DefaultWsInMessage} from "@common/ws/common";
import {AddRoomBase} from "@common/model/ws.base";

export interface AddRoomBody extends AddRoomBase {
  channelUsers: number[];
  channelId: number;
}

export type AddRoomMessage = DefaultWsInMessage<"addRoom", "room", AddRoomBody>;
