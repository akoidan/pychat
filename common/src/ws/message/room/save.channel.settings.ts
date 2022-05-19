import type {DefaultWsInMessage} from "@common/ws/common";
import type {ChannelDto} from "@common/model/dto/channel.dto";

export interface SaveChannelSettingsBody extends ChannelDto {
  notifications: boolean;
  volume: number;
  p2p: boolean;
  userId: number;
}

export type SaveChannelSettingsMessage = DefaultWsInMessage<"saveChannelSettings", "room", SaveChannelSettingsBody>;
