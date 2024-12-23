import {ChannelDto} from "@common/model/dto/channel.dto";
import {RoomDto} from "@common/model/dto/room.dto";
import {MessageModelDto} from "@common/model/dto/message.model.dto";

export interface ChangeUserOnlineBase {
  online: Record<number, string[]>;
  userId: number;
  lastTimeOnline: number;
  time: number;
}

export interface NewRoom {
  inviterUserId: number;
  time: number;
}

export interface RoomExistedBefore {
  inviteeUserId: number[];
}

export interface AddRoomBase extends NewRoom, ChannelDto, RoomDto {
}

export interface MessagesResponseMessage {
  content: MessageModelDto[];
}


export type ChangeDeviceType =
  "i_deleted"
  | "invited"
  | "room_created"
  | "someone_joined"
  | "someone_left";
export type ChangeOnlineType =
  "appear_online"
  | "gone_offline";
