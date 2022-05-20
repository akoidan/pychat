import {ChannelDto} from "@common/model/dto/channel.dto";
import {RoomDto} from "@common/model/dto/room.dto";
import {UserDto} from "@common/model/dto/user.dto";


import {DefaultInnerSystemMessage} from "@/ts/types/messages/helper";


export interface PubSetRoomsMessageBody {
  rooms: RoomDto[];
  channels: ChannelDto[];
  users: UserDto[];
  online: Record<string, string[]>;
}

export type PubSetRoomsMessage = DefaultInnerSystemMessage<"init", "room", PubSetRoomsMessageBody>;
