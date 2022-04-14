import type {
  BlobType,
  ChannelsDictModel,
  CurrentUserInfoModel,
  CurrentUserSettingsModel,
  MessageStatus,
  RoomDictModel,
  UserModel,
} from "@/ts/types/model";

export * from '@/ts/types/backend';

import type {LogLevel} from "lines-logger";
import {Gender} from '@/ts/types/backend';







export interface ViewUserProfileDto extends UserProfileDto {
  image: string;
}

export type SaveFileResponse = Record<string, {fileId: number; previewFileId?: number}>;



export interface SetStateFromWS {
  roomsDict: RoomDictModel;
  channelsDict: ChannelsDictModel;
  allUsersDict: Record<number, UserModel>;
}

export interface SetStateFromStorage {
  roomsDict: RoomDictModel;
  channelsDict: ChannelsDictModel;
  settings: CurrentUserSettingsModel;
  profile: CurrentUserInfoModel;
  allUsersDict: Record<number, UserModel>;
}



export interface GiphyDto {
  webp: string;
  url: string;
  symbol: string;
}

export interface OauthStatus {
  google: boolean;
  facebook: boolean;
}


export interface WebRtcMessageModelDto extends Omit<MessageModelDto, "roomId" | "time" | "userId"> {
  timeDiff: number;
}
