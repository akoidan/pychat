import {DefaultInnerSystemMessage} from "@/ts/types/messages/helper";
import type {RoomDto} from "@common/model/dto/room.dto";
import type {ChannelDto} from "@common/model/dto/channel.dto";
import type {UserDto} from "@common/model/dto/user.dto";


export interface PubSetRoomsMessageBody {
  rooms: RoomDto[];
  channels: ChannelDto[];
  users: UserDto[];
  online: Record<string, string[]>;
}

export type PubSetRoomsMessage = DefaultInnerSystemMessage<"init", "room", PubSetRoomsMessageBody>;
