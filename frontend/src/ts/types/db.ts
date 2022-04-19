import type {LogLevel} from "lines-logger";
import {MessageStatusInner} from '@/ts/types/model';

export interface UserDB {
  id: number;
  username: string;
  sex: SexDB;
  last_time_online: number;
  deleted: BooleanDB;
  country_code: string;
  country: string;
  thumbnail: string;
  region: string;
  city: string;
}

export type SexDB = Gender;
export type BooleanDB =
  0
  | 1;

export interface RoomDB {
  id: number;
  name: string;
  notifications: BooleanDB;
  p2p: BooleanDB;
  volume: number;
  channel_id: number;
  is_main_in_channel: BooleanDB;
  deleted: BooleanDB;
  creator_id: number;
}

export interface ChannelDB {
  id: number;
  name: string;
  creator_id: number;
}

export interface TagDB {
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
  parent_message_id: number | null;
  thread_messages_count: number;
  deleted: BooleanDB;
  edited: number;
  room_id: number;
  user_id: number;
  status: MessageStatusInner;
}

export interface FileDB {
  id: number;
  name: string;
  preview_file_id: number; //  So this is UploadFile.id for "preview" File
  file_id: number; // So this is UploadFile.id for "url" File
  server_id: number; // If we saved this file on backend, it would have its id
  symbol: string;
  sending: BooleanDB;
  url: string;
  message_id: number;
  type: string;
  preview: string;
}

export interface SettingsDB {
  user_id: number;
  embedded_youtube: BooleanDB;
  highlight_code: BooleanDB;
  incoming_file_call_sound: BooleanDB;
  message_sound: BooleanDB;
  online_change_sound: BooleanDB;
  show_when_i_typing: BooleanDB;
  send_logs: BooleanDB;
  suggestions: BooleanDB;
  theme: string;
  logs: LogLevel;
}

export interface ProfileDB {
  user_id: number;
  username: string;
  name: string;
  city: string;
  thumbnail: string;
  surname: string;
  email: string;
  birthday: Date;
  contacts: string;
  sex: SexDB;
}

export interface RoomUsersDB {
  room_id: number;
  user_id: number;
}
