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
  volume: number;
  deleted: BooleanDB ;
}

export interface RoomSettingsDB {
  id: number;
  name: string;
  notifications: BooleanDB;
  volume: number;
  deleted: BooleanDB ;
}

export interface MessageDB {
  id: number;
  time: number;
  content: string;
  symbol: string;
  deleted: BooleanDB;
  giphy: string;
  edited: number;
  roomId: number;
  userId: number;
  sending: BooleanDB;
}

export interface FileDB {
  id: number;
  symbol: string;
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
  logs: BooleanDB;
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

export type TransactionType = "transaction";
