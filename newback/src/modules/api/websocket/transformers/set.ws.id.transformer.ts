import {TransformSetWsIdDataParams} from '@/data/types/internal';
import {SetWsIdMessage} from '@/data/types/frontend';
import {getTransformRoomFn} from '@/modules/api/websocket/transformers/room.transformer';
import {transformChannelsDto} from '@/modules/api/websocket/transformers/channel.transformer';
import {transformUserDto} from '@/modules/api/websocket/transformers/user.transformer';
import {transformProfile} from '@/modules/api/websocket/transformers/profile.transformer';
import {transformSettings} from '@/modules/api/websocket/transformers/settings.transformer';

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
  return {
    action: "setWsId",
    channels: channels.map(transformChannelsDto),
    rooms: myRooms.map(getTransformRoomFn(allUsersInTheseRooms)),
    handler: "ws",
    time,
    users: users.map(transformUserDto),
    online,
    opponentWsId: id,
    profile: transformProfile(user),
    settings: transformSettings(user),
  };
}
