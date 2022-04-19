import type {RoomModel} from "@/data/model/room.model";
import type {RoomUsersModel} from "@/data/model/room.users.model";
import type {ChannelModel} from "@/data/model/channel.model";
import type {UserModel} from "@/data/model/user.model";
import { DefaultWsInMessage } from '@/data/shared/ws.in.messages';
import { HandlerName } from '@/data/shared/common';

export interface WebSocketContextData {
  userId: number;
  id: string;

  sendToClient(data: DefaultWsInMessage<any, any>);
}

export type UserOnlineData = Record<string, string[]>;

// https://stackoverflow.com/questions/48881009/convert-tinyint-field-as-boolean-in-result-using-sequelize-raw-query-node-js
export type MysqlBool =
  0
  | 1
  | false
  | true;

export interface FileSaveResponse {
  originFileName: string;
  previewFileName: string;
}

export interface OnWsClose {
  closeConnection(context: WebSocketContextData);
}

export interface PubSubMessage<A extends string, H extends HandlerName> {
  body: DefaultWsInMessage<A, H>;
}

/*
 * Export interface SendToClientPubSubMessage<A extends string, H extends HandlerName> extends PubSubMessage<A, H>{
 * }
 */
export type SendToClientPubSubMessage<DATA extends DefaultWsInMessage<A, H>, A extends string, H extends HandlerName> = PubSubMessage<A, H>;


export interface TransformSetWsIdDataParams {
  myRooms: GetRoomsForUser[];
  allUsersInTheseRooms: Pick<RoomUsersModel, "roomId" | "userId">[];
  channels: ChannelModel[];
  users: UserModel[];
  online: UserOnlineData;
  id: string;
  time: number;
  user: UserModel;
}

type RoomSingleRoomUser = Omit<RoomModel, "roomUsers">;

export interface GetRoomsForUser extends RoomSingleRoomUser {
  roomUsers: RoomUsersModel;
}

// https://stackoverflow.com/a/49725198/3872976
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  {
    [K in Keys]-?: Partial<Pick<T, Exclude<Keys, K>>> & Required<Pick<T, K>>
  }[Keys]
  & Pick<T, Exclude<keyof T, Keys>>;


// Based on https://stackoverflow.com/a/69756175/3872976
export type PureModel<T> = {
  [P in keyof Omit<T, "isNewRecord" | "version"> as T[P] extends Date | number[] | boolean | number | string | undefined ? P : never]: T[P]
};

export type PickByType<T, Value> = {
  [P in keyof T as T[P] extends Value | undefined ? P : never]: T[P]
};

export type CreateModel<T> = Omit<PureModel<T>, "createdAt" | "deletedAt" | "id" | "updatedAt">;
