import type {
  BlobType,
  ChannelsDictModel,
  CurrentUserInfoModel,
  CurrentUserSettingsModel,
  MessageStatus,
  RoomDictModel,
  UserModel,
} from "@/ts/types/model";

export * from './backend/dto';

import type {LogLevel} from "lines-logger";
import {Gender} from '@/ts/types/backend/dto';

export interface RoomNoUsersDto {
  channelId: number | null;
  notifications: boolean;
  p2p: boolean;
  volume: number;
  isMainInChannel: boolean;
  roomId: number;
  name: string;
  roomCreatorId: number;
}

export interface RoomDto extends RoomNoUsersDto {
  users: number[];
}

export interface ViewUserProfileDto extends UserProfileDto {
  image: string;
}

export type SaveFileResponse = Record<string, {fileId: number; previewFileId?: number}>;

export interface ChannelDto {
  channelName: string;
  channelId: number;
  channelCreatorId: number;
}

export interface UserDto {
  user: string;
  userId: number;
  userImage: string;
  lastTimeOnline: number;
  sex: Gender;
}

export interface LocationDto {
  city: string;
  country: string;
  countryCode: string;
  region: string;
}

export interface UserSettingsDto {
  embeddedYoutube: boolean;
  highlightCode: boolean;
  incomingFileCallSound: boolean;
  messageSound: boolean;
  onlineChangeSound: boolean;
  sendLogs: boolean;
  showWhenITyping: boolean;
  suggestions: boolean;
  logs: LogLevel;
  theme: string;
}

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

export interface UserProfileDtoWoImage {
  user: string;
  name: string;
  city: string;
  surname: string;
  email: string;
  birthday: string;
  contacts: string;
  sex: Gender;
  userId: number;
}

export interface UserProfileDto extends UserProfileDtoWoImage {
  userImage: string;
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

export interface FileModelDto {
  url: string;
  id: number;
  type: BlobType;
  preview: string;
}

export interface MessageModelDto {
  id: number;
  time: number;
  parentMessage: number;
  files?: Record<number, FileModelDto>;
  tags: Record<number, number>;
  content: string;
  status: MessageStatus;
  symbol?: string;
  deleted?: boolean;
  threadMessagesCount: number;
  edited: number;
  roomId: number;
  userId: number;
}

export interface WebRtcMessageModelDto extends Omit<MessageModelDto, "roomId" | "time" | "userId"> {
  timeDiff: number;
}
