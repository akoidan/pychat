import {
  CurrentUserInfoModel, CurrentUserSettingsModel,
  FileModel,
  MessageModel, RoomDictModel, RoomModel,
  RoomSettingsModel,
  SearchModel,
  UploadProgressModel,
  UserModel
} from './model';

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

export interface SetUploadProgress {
  upload: UploadProgressModel;
  roomId: number;
  messageId: number;
}

export interface SetMessageProgressError {
  messageId: number;
  roomId: number;
  error: string;
}

export interface RemoveSendingMessage {
  messageId: number;
  roomId: number;
}

export  interface IStorage {
  // getIds(cb: SingleParamCB<object>);
  saveMessages(messages: MessageModel[]);
  deleteMessage(id: number);
  deleteRoom(id: number);
  saveMessage(m: MessageModel);
  updateRoom(m: RoomSettingsModel);
  setRooms(rooms: RoomSettingsModel[]);
  saveRoom(room: RoomModel);
  setUserProfile(user: CurrentUserInfoModel);
  setUserSettings( settings: CurrentUserSettingsModel);
  saveRoomUsers(ru: SetRoomsUsers);
  setUsers(users: UserModel[]);
  getAllTree(onReady: SingleParamCB<StorageData>);
  saveUser(users: UserModel);
  clearStorage();
  connect(cb: Function);
  // getRoomHeaderId(roomId: number, cb: SingleParamCB<number>);
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

export interface SetRooms {
  roomsDict: RoomDictModel;
  settings: CurrentUserSettingsModel;
  profile: CurrentUserInfoModel;
  allUsersDict: {[id: number]: UserModel};
}

export interface StorageData {
  setRooms: SetRooms;
  sendingMessages: MessageModel[];
}

export interface MessagesLocation {
  roomId: number;
  messages: MessageModel[];
}

export interface SetRoomsUsers {
  roomId: number;
  users: number[];
}

export interface RemoveMessageProgress {
  messageId: number;
  roomId: number;
}

export interface SetMessageProgress extends RemoveMessageProgress{
  total: number;
  uploaded: number;
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