import type {DefaultWsInMessage} from "@common/ws/common";

export interface DeleteRoomWsInBody {
  roomId: number;
}

export type DeleteRoomWsInMessage = DefaultWsInMessage<"deleteRoom", "room", DeleteRoomWsInBody>;
