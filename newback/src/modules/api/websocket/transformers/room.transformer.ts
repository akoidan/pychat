import {RoomUsersModel} from '@/data/model/room.users.model';
import {GetRoomsForUser} from '@/data/types/internal';
import {RoomDto} from '@/data/types/frontend';

export function getTransformRoomFn(allUsersInTheseRooms: Pick<RoomUsersModel, "roomId" | "userId">[]): (r: GetRoomsForUser) => RoomDto {
  const roomUsersIdInfoDict: Record<string, number[]> = allUsersInTheseRooms.reduce<Record<string, number[]>>((previousValue, currentValue) => {
    if (!previousValue[currentValue.roomId]) {
      previousValue[currentValue.roomId] = [];
    }
    previousValue[currentValue.roomId].push(currentValue.userId);
    return previousValue;
  }, {});
  return (room: GetRoomsForUser) => ({
    name: room.name,
    id: room.id,
    channelId: room.channelId,
    p2p: Boolean(room.p2p),
    notifications: Boolean(room.roomUsers.notifications),
    users: roomUsersIdInfoDict[room.id],
    isMainInChannel: Boolean(room.isMainInChannel),
    creatorId: room.creatorId,
    volume: room.roomUsers.volume,
  });
}
