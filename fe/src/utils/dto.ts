import {CurrentUserInfo, FileModel, MessageModel, RoomModel, SexModel, UserModel} from '../model';
import MesageHandler from './MesageHandler';


export interface DefaultMessage {
  action: string;
  handler: string;
}


export interface RoomDTO {
  name: string;
  users: number[];
  notifications: boolean;
  volume: number;
}

export interface SetWsIdMessage extends MesageHandler {
  rooms: { [id: number]: RoomDTO };
  users: { [id: number]: UserModel };
  online: number[];
  opponentWsId: string;
  userInfo: CurrentUserInfo;
}

interface ChangeUserOnline extends DefaultMessage {
  userId: number;
  sex: SexModel;
  content: number[];
  user: string;
  time: number;
}

export interface DeleteRoom extends DefaultMessage {
  roomId: number;
}

export interface AddOnlineUser extends ChangeUserOnline {}
export interface RemoveOnlineUser extends ChangeUserOnline {}

export interface ChatHandlerMessage extends DefaultMessage {
  roomId: number;
}

export interface SetRootMessage extends DefaultMessage {
  online: number[];
  users: { [id: number]: UserModel };
  content: RoomModel[];
}

export interface LoadMessages extends DefaultMessage {
  content: MessageModel[];
  roomId: number;
}

export interface GrowlMessage extends DefaultMessage {
  content: string;
}

export interface DeleteMessage extends DefaultMessage{
  roomId: number;
  id: number;
  edited: number;
}

export interface EditMessage extends DeleteMessage {
  messageId: number;
  userId: number;
  content: string;
  time: number;
  files: Map<number, FileModel>;
  symbol: string;
  giphy: string;
  deleted: boolean;
}
