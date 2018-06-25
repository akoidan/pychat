export enum SexModelDto {
  Male = 'Male',
  Female = 'Female',
  Secret = 'Secret'
}

export interface RoomDto {
  name: string;
  users: number[];
  notifications: boolean;
  volume: number;
  roomId: number;
}

export interface UserDto {
  user: string;
  userId: number;
  sex: SexModelDto;
}

export interface CurrentUserInfoDto {
  embeddedYoutube: boolean;
  highlightCode: boolean;
  incomingFileCallSound: boolean;
  messageSound: boolean;
  onlineChangeSound: boolean;
  sendLogs: boolean;
  suggestions: boolean;
  theme: string;
  user: string;
  userId: number;
}

export interface FileModelDto {
  id: number;
  url: string;
  type: string;
  preview: string;
}

export interface FileModelXhr {

}

export interface MessageModelDto {
  id: number;
  time: number;
  files: Map<number, FileModelDto>;
  content: string;
  symbol: string;
  deleted: boolean;
  giphy: string;
  edited: number;
  roomId: number;
  userId: number;
}