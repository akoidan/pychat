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

export interface UserModel {
  user: string;
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
  MALE = 'Male', FEMALE = 'Female', ALIEN = 'Secret'
}

export interface RoomSettings {
  name: string;
  notifications: boolean;
  volume: number;
}

export interface RoomModel extends RoomSettings {
  users: number[];
  messages: MessageModel[];
  allLoaded: boolean;
}

export interface RootState {
  isOnline: boolean;
  growls: GrowlModel[];
  editedMessage: EditingMessage;
  activeRoomId: number;
  activeUserId: number;
  userInfo: CurrentUserInfo;
  allUsers: { [id: number]: UserModel };
  regHeader: string;
  online: number[];
  rooms: {[id: string]: RoomModel};
}

