import type {DefaultWsInMessage} from "@common/ws/common";
import type {ChannelDto} from "@common/model/dto/channel.dto";

export interface DeleteChannelWsInBody {
  channelId: number;
  roomIds: number[];
}

export type DeleteChannelWsInMessage = DefaultWsInMessage<"deleteChannel", "room", DeleteChannelWsInBody>;
