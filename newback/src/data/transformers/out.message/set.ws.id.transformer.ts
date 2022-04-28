import type {TransformSetWsIdDataParams} from "@/data/types/internal";
import {transformChannelDto} from "@/data/transformers/model/channel.transformer";
import {transformSettings} from "@/data/transformers/model/settings.transformer";
import {transformUserDto} from "@/data/transformers/model/user.transformer";
import {transformProfileDto} from "@/data/transformers/model/profile.transformer";
import {
  getRoomsOnline,
  getTransformRoomDto,
} from "@/data/transformers/model/room.transformer";


export function transformSetWsId(
  {
    myRooms,
    allUsersInTheseRooms,
    channels,
    users,
    online,
    id,
    user,
    time,
  }: TransformSetWsIdDataParams
): SetWsIdMessage {
  const roomsOnlineDict = getRoomsOnline(allUsersInTheseRooms);
  return {
    action: "setWsId",
    channels: channels.map(transformChannelDto),
    rooms: myRooms.map((room) => getTransformRoomDto(roomsOnlineDict[room.id], room)),
    handler: "ws",
    time,
    users: users.map(transformUserDto),
    online,
    opponentWsId: id,
    profile: transformProfileDto(user),
    settings: transformSettings(user),
  };
}
