import {
  ChangeOnline,
  CurrentUserInfoModel,
  CurrentUserSettingsModel,
  FileModel,
  MessageModel,
  RoomModel,
  RoomSettingsModel,
  SearchModel, SendingFile,
  UploadProgressModel,
  UserModel
} from './model';
import {RoomDto, SetRooms, UserDto} from './dto';
import {DefaultMessage} from './messages';


export interface UploadFile {
   type: string;
   symbol: string;
   file: File;
}

export interface IMessageHandler {
  handle(message: DefaultMessage);
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

export interface ChangeOnlineEntry {
  changeOnline: ChangeOnline;
  roomIds: number[];
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

  getAllTree(): Promise<StorageData>;
  saveUser(users: UserModel);
  clearStorage();
  connect();
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

export interface SetSendingFile {
  roomId: number;
  sendingFile: SendingFile;
}

export interface StorageData {
  setRooms: SetRooms;
  sendingMessages: MessageModel[];
}

export interface MessagesLocation {
  roomId: number;
  messages: MessageModel[];
}

export interface PrivateRoomsIds {
  userRooms: {};
  roomUsers: {};
}
export interface SetRoomsUsers {
  roomId: number;
  users: number[];
}

export interface RemoveMessageProgress {
  messageId: number;
  roomId: number;
}

export interface PubSetRooms extends DefaultMessage {
  rooms:  RoomDto[];
  users: UserDto[];
  online: number[];
}

export interface SetMessageProgress extends RemoveMessageProgress {
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