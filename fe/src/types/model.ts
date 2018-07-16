import {UploadFile} from './types';

export enum GrowlType {
  SUCCESS = 'col-success', INFO = 'col-info', ERROR = 'col-error'
}

export  interface GrowlModel {
  id: number;
  title: string;
  type: GrowlType;
}

export interface EditingMessage {
  messageId: number;
  roomId: number;
  isEditingNow: boolean;
}

export interface CurrentUserSettingsModel {
  embeddedYoutube: boolean;
  highlightCode: boolean;
  incomingFileCallSound: boolean;
  messageSound: boolean;
  onlineChangeSound: boolean;
  sendLogs: boolean;
  suggestions: boolean;
  theme: string;
  logs: boolean;
}

export interface CurrentUserInfoModel {
  userId: number;
  user: string;
  name: string;
  city: string;
  surname: string;
  email: string;
  birthday: string;
  contacts: string;
  sex: string;
}

export interface UserModel {
  user: string;
  id: number;
  sex: SexModel;
}

export  interface FileModel {
  id: number;
  url: string;
  type: string;
  preview: string;
}

export interface UploadProgressModel {
  total: number;
  uploaded: number;
}

export interface MessageTransferInfo {
  upload: UploadProgressModel;
  error: string;
}

export  interface MessageModel {
  id: number;
  time: number;
  files: {[id: number]: FileModel};
  content: string;
  symbol: string;
  deleted: boolean;
  giphy: string;
  edited: number;
  roomId: number;
  userId: number;
  transfer: MessageTransferInfo;
}

export enum SexModel {
  Male = 'Male', Female = 'Female', Secret = 'Secret'
}

export interface RoomSettingsModel {
  id: number;
  name: string;
  notifications: boolean;
  volume: number;
}

export interface UserDictModel {
  [id: string]: UserModel;
}


export interface RoomDictModel {
  [id: string]: RoomModel;
}


export interface SearchModel {
  searchActive: boolean;
  searchedIds: number[];
  searchText: string;
  locked: boolean;
}

export interface ChangeOnline {
  userId: number;
  isWentOnline: boolean;
  time: number;
}

export interface SendingFileTransfer {
  status: FileTransferStatus;
  userId: number;
  upload: UploadProgressModel;
  error: string;
}

export enum FileTransferStatus {
  NOT_DECIDED_YET, DECLINED_BY_OPPONENT, DECLINED_BY_YOU, FINISHED, ERROR, IN_PROGRESS
}

export interface ReceivingFile {
  time: number;
  upload: UploadProgressModel;
  status: FileTransferStatus;
  fileName: string;
  opponentWsId: string;
  roomId: number;
  connId: string;
  anchor: string;
  error: string;
  userId: number;
}

export interface SendingFile {
  time: number;
  fileName: string;
  roomId: number;
  connId: string;
  fileSize: number;
  transfers: { [id: string]: SendingFileTransfer };
}

export interface RoomModel extends RoomSettingsModel {
  users: number[];
  callContainer: boolean;
  sendingFiles:  { [id: string]: SendingFile };
  receivingFiles:  { [id: string]: ReceivingFile };
  messages: { [id: number]: MessageModel };
  allLoaded: boolean;
  search: SearchModel;
  newMessagesCount: number;
  changeOnline: ChangeOnline[];
}

export interface RootState {
  isOnline: boolean;
  growls: GrowlModel[];
  dim: boolean;
  editedMessage: EditingMessage;
  activeRoomId: number;
  activeUserId: number;
  userInfo: CurrentUserInfoModel;
  userSettings: CurrentUserSettingsModel;
  userImage: string;
  allUsersDict: UserDictModel;
  regHeader: string;
  online: number[];
  roomsDict: RoomDictModel;
}

