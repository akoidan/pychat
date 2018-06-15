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

export  interface GrowlModel {
  id: number;
  title: string;
  type: GrowlType;
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


export  interface IStorage {
  getIds(cb: ObjectCb);
  saveMessages(messages: MessageModel[]);
  deleteMessage(id: number);
  clearStorage();
  connect(cb: Function);
  getRoomHeaderId(roomId: number, cb: NumberCb);
  setRoomHeaderId(roomId: number, value: number);
}

export enum GrowlType {
  SUCCESS = 'col-success', INFO = 'col-info', ERROR = 'col-error'
}

export interface MessageHandler {
  handle(message: DefaultMessage);
}

export interface RoomModel {
  id: number;
  name: string;
  users: number[];
  notifications: boolean;
  volume: VolumeLevelModel;
}

export enum SexModel {
  MALE = 'col-success', FEMALE = 'col-info', ALIEN = 'col-error'
}

export enum VolumeLevelModel {
  OFF = 0, LOW = 1, MID = 2, HIGH = 3
}

export interface UserModel {
  user: string;
  sex: SexModel;
  id: number;
}

export interface CurrentUserInfo {
  name: string;
  sex: string;
  id: number;
}

export interface DefaultMessage {
  action: string;
  handler: string;
}

export interface ChatHandlerMessage extends DefaultMessage{
  roomId: number;
}

export interface SetRootMessage extends DefaultMessage {
  online: number[];
  users: UserModel;
  content: RoomModel[];
}

export interface RootState {
  isOnline: boolean;
  growls: GrowlModel[];
  theme: string;
  userInfo: CurrentUserInfo;
  regHeader: string;
  sessionId: string;
}