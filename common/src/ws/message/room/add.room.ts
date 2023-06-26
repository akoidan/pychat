import type {DefaultWsInMessage, DefaultWsOutMessage} from "@common/ws/common";
import {AddRoomBase} from "@common/model/ws.base";

export interface AddRoomWsInBody extends AddRoomBase {
  channelUsers: number[];
  channelId: number;
}

export interface AddRoomWsOutBody {
  name: string | null;
  p2p: boolean;
  volume: number;
  notifications: boolean;
  users: number[];
  channelId: number | null;
}

export type AddRoomWsInMessage = DefaultWsInMessage<"addRoom", "room", AddRoomWsInBody>;
export type AddRoomWsOutMessage = DefaultWsOutMessage<"addRoom", AddRoomWsOutBody>;
