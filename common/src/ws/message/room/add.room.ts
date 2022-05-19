import type {DefaultWsInMessage} from "@common/ws/common";
import type {AddRoomBase} from "@common/legacy";

export interface AddRoomBody extends AddRoomBase {
  channelUsers: number[];
  channelId: number;
}

export type AddRoomMessage = DefaultWsInMessage<"addRoom", "room", AddRoomBody>;
