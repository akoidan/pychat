import type {DefaultWsInMessage} from "@common/ws/common";
import type {ChannelDto} from "@common/model/dto/channel.dto";

export interface DeleteChannelBody {
  channelId: number;
  roomIds: number[];
}

export type DeleteChannelMessage = DefaultWsInMessage<"deleteChannel", "room", DeleteChannelBody>;
