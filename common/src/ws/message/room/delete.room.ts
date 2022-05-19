import type {DefaultWsInMessage} from "@common/ws/common";

export interface DeleteRoomBody {
  roomId: number;
}

export type DeleteRoomMessage = DefaultWsInMessage<"deleteRoom", "room", DeleteRoomBody>;
