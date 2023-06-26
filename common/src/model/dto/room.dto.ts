export interface RoomNoUsersDto {
  channelId: number | null;
  notifications: boolean;
  p2p: boolean;
  volume: number;
  isMainInChannel: boolean;
  id: number;
  name: string;
  creatorId: number;
}

export interface RoomDto extends RoomNoUsersDto {
  users: number[];
}
