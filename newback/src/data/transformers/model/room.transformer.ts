import type {RoomUsersModel} from "@/data/model/room.users.model";
import type {GetRoomsForUser} from "@/data/types/internal";
import { RoomDto } from '@/data/shared/dto';

export function getTransformRoomDto(users: number[], room: GetRoomsForUser): RoomDto {
  return {
    name: room.name,
    id: room.id,
    channelId: room.channelId,
    p2p: Boolean(room.p2p),
    notifications: Boolean(room.roomUsers.notifications),
    users,
    isMainInChannel: Boolean(room.isMainInChannel),
    creatorId: room.creatorId,
    volume: room.roomUsers.volume,
  };
}

export function getRoomsOnline(allUsersInTheseRooms: Pick<RoomUsersModel, "roomId" | "userId">[]): Record<string, number[]> {
  return allUsersInTheseRooms.reduce<Record<string, number[]>>((previousValue, currentValue) => {
    if (!previousValue[currentValue.roomId]) {
      previousValue[currentValue.roomId] = [];
    }
    previousValue[currentValue.roomId].push(currentValue.userId);
    return previousValue;
  }, {});
}
