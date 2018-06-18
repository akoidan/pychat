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

export enum IconColor {
  SUCCESS = 'success', ERROR = 'error', WARN = 'warn', NOT_SET = ''
}

export interface RoomModel {
  name: string;
  users: number[];
  notifications: boolean;
  volume: VolumeLevelModel;
  messages: MessageModel[];
  allLoaded: boolean;
}

export interface SmileyStructure {
  alt: string;
  src: string;
}

export enum SexModel {
  MALE = 'Male', FEMALE = 'Female', ALIEN = 'Secret'
}

export enum VolumeLevelModel {
  OFF = 0, LOW = 1, MID = 2, HIGH = 3
}

export interface UserModel {
  user: string;
  sex: SexModel;
}

export interface CurrentUserInfo {
  embeddedYoutube: boolean;
  highlightCode: boolean;
  incomingFileCallSound: boolean;
  messageSound: boolean;
  onlineChangeSound: boolean;
  sendLogs: boolean;
  suggestions: boolean;
  theme: string;
  user: string;
  userId: number;
}

export interface EditingMessage {
  messageId: number;
  isEditingNow: boolean;
}

export interface RootState {
  isOnline: boolean;
  growls: GrowlModel[];
  theme: string;
  editedMessage: EditingMessage;
  activeRoomId: number;
  userInfo: CurrentUserInfo;
  allUsers: { [id: number]: UserModel };
  regHeader: string;
  online: number[];
  rooms: {[id: string]: RoomModel};
}

export interface SessionHolder {
  session: string;
}