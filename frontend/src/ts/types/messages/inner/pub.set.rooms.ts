import {DefaultInnerSystemMessage} from "@/ts/types/messages/helper";





export interface PubSetRoomsMessageBody {
  rooms: RoomDto[];
  channels: ChannelDto[];
  users: UserDto[];
  online: Record<string, string[]>;
}

export type PubSetRoomsMessage = DefaultInnerSystemMessage<"init", "room", PubSetRoomsMessageBody>;
