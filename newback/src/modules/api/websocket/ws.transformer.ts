import {
  ChannelDto,
  RoomDto,
  SetWsIdMessage,
  UserDto,
  UserProfileDto,
  UserSettingsDto
} from '@/data/types/frontend';
import {UserModel} from '@/data/model/user.model';
import {UserOnlineData} from '@/data/types/internal';
import {ChannelModel} from '@/data/model/channel.model';
import {RoomUsersModel} from '@/data/model/room.users.model';
import {GetRoomsForUser} from '@/modules/rest/database/repository/room.repository';

export interface TransformSetWsIdDataParams {
  myRooms: GetRoomsForUser[];
  allUsersInTheseRooms: Pick<RoomUsersModel, 'roomId' | 'userId'>[];
  channels: ChannelModel[];
  users: UserModel[];
  online: UserOnlineData;
  id: string;
  time: number;
  user: UserModel;
}

// function transformUserSettings(db: UserSettingsModel): UserSettingsDto {
//   return Object.keys(convert<UserSettingsDto>()).reduce((previousValue, currentValue) => {
//     previousValue[currentValue] = db[currentValue];
//     return previousValue;
//   }, {} as UserSettingsDto)
// }

function transformProfile(user: UserModel): UserProfileDto {
  return {
    username: user.username,
    name: user.userProfile.name,
    sex: user.sex,
    id: user.id,
    city: user.userProfile.city,
    email: user.userAuth.email,
    birthday: user.userProfile.birthday,
    contacts: user.userProfile.contacts,
    surname: user.userProfile.surname,
    thumbnail: user.thumbnail
  };
}

function transformSettings(user: UserModel): UserSettingsDto {
  return {
    embeddedYoutube: !!user.userSettings.embeddedYoutube,
    highlightCode: !!user.userSettings.highlightCode,
    incomingFileCallSound: !!user.userSettings.incomingFileCallSound,
    messageSound: !!user.userSettings.messageSound,
    onlineChangeSound: !!user.userSettings.onlineChangeSound,
    showWhenITyping: !!user.userSettings.showWhenITyping,
    suggestions: !!user.userSettings.suggestions,
    theme: user.userSettings.theme,
    logs: user.userSettings.logs
  };
}

function transformUserDto(u: UserModel): UserDto {
  return {
    username: u.username,
    id: u.id,
    thumbnail: u.thumbnail,
    sex: u.sex,
    lastTimeOnline: u.lastTimeOnline
  };
}

function transformChannelsDto(c: ChannelModel): ChannelDto {
  return {
    name: c.name,
    id: c.id,
    creatorId: c.creatorId
  };
}

function getTransformRoomFn(allUsersInTheseRooms: Pick<RoomUsersModel, 'roomId' | 'userId'>[]): (r: GetRoomsForUser) => RoomDto {
  let roomUsersIdInfoDict: Record<string, number[]> = allUsersInTheseRooms.reduce((previousValue, currentValue) => {
    if (!previousValue[currentValue.roomId]) {
      previousValue[currentValue.roomId] = []
    }
    previousValue[currentValue.roomId].push(currentValue.userId);
    return previousValue;
  }, {} as Record<string, number[]>);
  return (room: GetRoomsForUser) => {
    return {
      name: room.name,
      id: room.id,
      channelId: room.channelId,
      p2p: !!room.p2p,
      notifications: !!room.roomUsers.notifications,
      users: roomUsersIdInfoDict[room.id],
      isMainInChannel: !!room.isMainInChannel,
      creatorId: room.creatorId,
      volume: room.roomUsers.volume,
    };
  }
}


export function transformSetWsId(
  {
    myRooms,
    allUsersInTheseRooms,
    channels,
    users,
    online,
    id,
    user,
    time
  }: TransformSetWsIdDataParams): SetWsIdMessage {
  return {
    action: "setWsId",
    channels: channels.map(transformChannelsDto),
    rooms: myRooms.map(getTransformRoomFn(allUsersInTheseRooms)),
    handler: "ws",
    time,
    users: users.map(transformUserDto),
    online: online,
    opponentWsId: id,
    profile: transformProfile(user),
    settings: transformSettings(user),
  }
}
