import type {DefaultWsInMessage} from "@common/ws/common";
import type {ChannelDto} from "@common/model/dto/channel.dto";
import type {RoomDto} from "@common/model/dto/room.dto";
import {NewRoom} from "@common/model/ws.base";

export interface AddChannelWsInBody extends ChannelDto, Omit<RoomDto, "channelId">, NewRoom {
  channelUsers: number[];
}

export type AddChannelWsInMessage = DefaultWsInMessage<"addChannel", "room", AddChannelWsInBody>;