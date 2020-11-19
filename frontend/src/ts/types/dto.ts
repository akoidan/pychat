import {
  BlobType,
  ChannelsDictModel,
  CurrentUserInfoModel,
  CurrentUserSettingsModel,
  RoomDictModel,
  SexModelString,
  UserModel
} from '@/ts/types/model';

export type SexModelDto = 'Male' | 'Female' |'Secret';


export interface RoomNoUsersDto {
  channelId: number|null;
  notifications: boolean;
  p2p: boolean;
  volume: number;
  roomId: number;
  name: string;
  roomCreatorId: number;
}

export interface RoomDto  extends  RoomNoUsersDto {
  users: number[];
}

export interface ViewUserProfileDto extends UserProfileDto {
  image: string;
}

export type SaveFileResponse = {symbol: string; id: number}[];

export interface ChannelDto {
  channelName: string;
  channelId: number;
  channelCreatorId: number;
}

export interface UserDto {
  user: string;
  userId: number;
  sex: SexModelString;
  location: LocationDto;
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
  suggestions: boolean;
  logs: boolean;
  theme: string;
}


export interface SetStateFromWS {
  roomsDict: RoomDictModel;
  channelsDict: ChannelsDictModel;
  allUsersDict: {[id: number]: UserModel};
}


export interface SetStateFromStorage {
  roomsDict: RoomDictModel;
  channelsDict: ChannelsDictModel;
  settings: CurrentUserSettingsModel;
  profile: CurrentUserInfoModel;
  allUsersDict: {[id: number]: UserModel};
}

export interface UserProfileDto {
  user: string;
  name: string;
  city: string;
  surname: string;
  email: string;
  birthday: string;
  contacts: string;
  sex: SexModelDto;
  userId: number;
}

export interface FileModelDto {
  id: number;
  previewId: number;
  url: string;
  type: BlobType;
  preview: string;
}

export interface MessageModelDto {
  id: number;
  time: number;
  files?: {[id: number]: FileModelDto};
  content: string;
  symbol?: string;
  deleted?: boolean;
  giphy?: string;
  edited: number;
  roomId: number;
  userId: number;
}

export interface WebRtcMessageModelDto extends Omit<MessageModelDto, 'userId'| 'roomId'| 'time'> {
  timeDiff: number;
}
