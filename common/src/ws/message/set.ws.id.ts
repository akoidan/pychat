import {DefaultWsInMessage} from "@common/ws/common";
import {RoomDto} from "@common/model/dto/room.dto";
import {ChannelDto} from "@common/model/dto/channel.dto";
import {UserDto} from "@common/model/dto/user.dto";
import {UserProfileDto} from "@common/model/dto/user.profile.dto";
import {UserSettingsDto} from "@common/model/dto/user.settings.dto";

export interface SetWsIdWsOutBody {
  rooms: RoomDto[];
  opponentWsId: string;
  channels: ChannelDto[];
  users: UserDto[];
  online: Record<number, string[]>;
  time: number;
  profile: UserProfileDto;
  settings: UserSettingsDto;
}
export type SetWsIdWsOutMessage = DefaultWsInMessage<"setWsId", "ws", SetWsIdWsOutBody>;
