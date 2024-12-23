import type {DefaultWsInMessage} from "@common/ws/common";
import type {RoomNoUsersDto} from "@common/model/dto/room.dto";

export type SaveRoomSettingsWsInBody = RoomNoUsersDto;
export type SaveRoomSettingsWsInMessage = DefaultWsInMessage<"saveRoomSettings", "room", SaveRoomSettingsWsInBody>;
