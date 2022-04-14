import {
  ChannelDto,
  RoomDto,
  SetWsIdMessage,
  UserDto
} from '@/data/types/frontend';
import {UserModel} from '@/data/model/user.model';
import {UserOnlineData} from '@/data/types/internal';
import {ChannelModel} from '@/data/model/channel.model';
import {RoomUsersModel} from '@/data/model/room.users.model';
import {GetRoomsForUser} from '@/modules/rest/database/repository/room.repository';


export interface TransformSetWsIdData {
  myRooms: GetRoomsForUser[];
  allUsersInTheseRooms: Pick<RoomUsersModel, 'roomId' | 'userId'>[];
  channels: ChannelModel[];
  users: UserModel[];
  online: UserOnlineData;
  id: string;
  time: number;
  user: UserModel;
}

export function transformSetWsId({myRooms, allUsersInTheseRooms, channels, users, online, id, user, time}: TransformSetWsIdData): SetWsIdMessage {

  let roomUsersIdInfoDict = allUsersInTheseRooms.reduce((previousValue, currentValue) => {
    if (!previousValue[currentValue.roomId]) {
      previousValue[currentValue.roomId] = []
    }
    previousValue[currentValue.roomId].push(currentValue.userId);
    return previousValue;
  }, {} as Record<string, number[]>);
  let rooms: RoomDto[] = myRooms.map(room => ({
    name: room.name,
    id: room.id,
    channelId: room.channelId,
    p2p: room.p2p,
    notifications: room.roomUsers.notifications,
    users: roomUsersIdInfoDict[room.id],
    isMainInChannel: room.isMainInChannel,
    creatorId: room.creatorId,
    volume: room.roomUsers.volume,
  }))
  let channelsResult: ChannelDto[] = channels.map(c => ({
    name: c.name,
    id: c.id,
    creatorId: c.creatorId
  }))
  let resultUsers: UserDto[] = users.map(u => ({
    username: u.username,
    id: u.id,
    thumbnail: u.thumbnail,
    sex: u.sex,
    lastTimeOnline: u.lastTimeOnline
  }))

  return {
    action: "setWsId",
    channels: channelsResult,
    rooms,
    handler: "ws",
    time,
    users: resultUsers,
    online: online,
    opponentWsId: id,
    profile: {
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
    },
    settings: {
      embeddedYoutube: user.userSettings.embeddedYoutube,
      highlightCode: user.userSettings.highlightCode,
      incomingFileCallSound: user.userSettings.incomingFileCallSound,
      messageSound: user.userSettings.messageSound,
      onlineChangeSound: user.userSettings.onlineChangeSound,
      showWhenITyping: user.userSettings.showWhenITyping,
      suggestions: user.userSettings.suggestions,
      theme: user.userSettings.theme,
      logs: user.userSettings.logs
    },
  }

}
