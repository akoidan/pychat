import {MessageModel} from './model';

export interface MessageDb {
  id: number;
  time: number;
  content: string;
  symbol: string;
  deleted: number;
  giphy: string;
  edited: number;
  roomId: number;
  userId: number;
}

export interface Logger {
  warn(format: String, ...args): Function;

  log(format: String, ...args): Function;

  error(format: String, ...args): Function;

  debug(format: String, ...args): Function;
}


export interface UploadFile {
   type: string;
   symbol: string;
   file: File;
}

export interface MessageDataEncode {
  messageContent: string;
  files: UploadFile[];
}


export  interface IStorage {
  getIds(cb: SingleParamCB<object>);
  saveMessages(messages: MessageModel[]);
  deleteMessage(id: number);
  clearStorage();
  connect(cb: Function);
  getRoomHeaderId(roomId: number, cb: SingleParamCB<number>);
  setRoomHeaderId(roomId: number, value: number);
}

export interface SetRoomsUsers {
  roomId: number;
  users: number[];
}

export interface MessageLocation {
  roomId: number;
  id: number;
  edited: number;
}

export interface AddMessagePayload {
  index: number;
  message: MessageModel;
}

export enum IconColor {
  SUCCESS = 'success', ERROR = 'error', WARN = 'warn', NOT_SET = ''
}

export interface SmileyStructure {
  alt: string;
  src: string;
}


export interface SessionHolder {
  session: string;
}