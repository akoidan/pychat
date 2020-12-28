import { LogLevel } from 'lines-logger';

export interface UserDB {
  id: number;
  user: string;
  sex: SexDB;
  deleted: BooleanDB;
  country_code: string;
  country: string;
  region: string;
  city: string;
}

export type SexDB = 0 | 1 | 2;
export type BooleanDB = 0 | 1;

export interface RoomDB {
  id: number;
  name: string;
  notifications: BooleanDB;
  p2p: BooleanDB;
  volume: number;
  channel_id: number;
  deleted: BooleanDB ;
  creator: number;
}

export  interface ChannelDB {
  id: number;
  name: string;
  creator: number;
}

export  interface TagDB {
  id: number;
  user_id: number;
  message_id: number;
  symbol: string;
}

export interface MessageDB {
  id: number;
  time: number;
  content: string;
  symbol: string;
  parent_message_id: number|null;
  thread_messages_count: number;
  deleted: BooleanDB;
  giphy: string;
  edited: number;
  roomId: number;
  userId: number;
  sending: BooleanDB;
}

export  interface FileDB {
  id: number;
  preview_file_id: number; //  so this is UploadFile.id for "preview" File
  file_id: number;  // so this is UploadFile.id for "url" File
  symbol: string;
  sending: BooleanDB;
  url: string;
  message_id: number;
  type: string;
  preview: string;
}

export interface SettingsDB {
  userId: number;
  embeddedYoutube: BooleanDB;
  highlightCode: BooleanDB;
  incomingFileCallSound: BooleanDB;
  messageSound: BooleanDB;
  onlineChangeSound: BooleanDB;
  sendLogs: BooleanDB;
  suggestions: BooleanDB;
  theme: string;
  logs: LogLevel;
}

export interface ProfileDB {
  userId: number;
  user: string;
  name: string;
  city: string;
  surname: string;
  email: string;
  birthday: string;
  contacts: string;
  sex: SexDB;
}

export interface RoomUsersDB {
  room_id: number;
  user_id: number;
}

export type TransactionType = 'transaction';
