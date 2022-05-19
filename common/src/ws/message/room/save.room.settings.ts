import type {DefaultWsInMessage} from "@common/ws/common";
import type {RoomNoUsersDto} from "@common/model/dto/room.dto";

export type SaveRoomSettingsBody = RoomNoUsersDto;
export type SaveRoomSettingsMessage = DefaultWsInMessage<"saveRoomSettings", "room", SaveRoomSettingsBody>;
