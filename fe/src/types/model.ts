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
  user: string;
  name: string;
  city: string;
  surname: string;
  email: string;
  birthday: string;
  contacts: string;
  sex: string;
  userId: number;
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

export  interface MessageModel {
  id: number;
  time: number;
  files: Map<number, FileModel>;
  content: string;
  symbol: string;
  deleted: boolean;
  giphy: string;
  edited: number;
  roomId: number;
  userId: number;
}


export enum SexModel {
  Male = 'Male', Female = 'Female', Secret = 'Secret'
}

export interface RoomSettingsModel {
  name: string;
  notifications: boolean;
  volume: number;
  id: number;
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

export interface RoomModel extends RoomSettingsModel {
  users: number[];
  messages: MessageModel[];
  allLoaded: boolean;
  search: SearchModel;
}

export interface RootState {
  isOnline: boolean;
  growls: GrowlModel[];
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

