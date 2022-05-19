import type {DefaultWsInMessage} from "@common/ws/common";
import type {NewRoom} from "@common/legacy";
import type {ChannelDto} from "@common/model/dto/channel.dto";
import type {RoomDto} from "@common/model/dto/room.dto";

export interface AddChannelBody extends ChannelDto, Omit<RoomDto, "channelId">, NewRoom {
  channelUsers: number[];
}

export type AddChannelMessage = DefaultWsInMessage<"addChannel", "room", AddChannelBody>;
