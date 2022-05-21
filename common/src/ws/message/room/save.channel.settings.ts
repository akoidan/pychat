import type {DefaultWsInMessage} from "@common/ws/common";
import type {ChannelDto} from "@common/model/dto/channel.dto";

export interface SaveChannelSettingsWsInBody extends ChannelDto {
  notifications: boolean;
  volume: number;
  p2p: boolean;
  userId: number;
}

export type SaveChannelSettingsWsInMessage = DefaultWsInMessage<"saveChannelSettings", "room", SaveChannelSettingsWsInBody>;
