import {FileModel, MessageModel, SearchModel, UploadProgressModel} from './model';

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


export interface UploadFile {
   type: string;
   symbol: string;
   file: File;
}

export interface MessageDataEncode {
  messageContent: string;
  files: UploadFile[];
  fileModels: { [id: number]: FileModel };
  currSymbol: string;
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

export interface PostData<T> {
  url: string;
  params?: object;
  cb: ErrorCB<T>;
  formData?: FormData;
  isJsonEncoded?: boolean;
  isJsonDecoded?: boolean;
  process?: Function;
}


export interface MessagesLocation {
  roomId: number;
  messages: MessageModel[];
}

export interface SetRoomsUsers {
  roomId: number;
  users: number[];
}

export interface SetMessageProgress {
  messageId: number;
  roomId: number;
  upload: UploadProgressModel;
}

export interface SetSearchTo {
  roomId: number;
  search: SearchModel;
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