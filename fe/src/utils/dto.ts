import {FileModel, MessageModel, RoomModel, SexModel, UserModel, VolumeLevelModel} from '../types';

export interface DefaultMessage {
  action: string;
  handler: string;
}

export interface MessageHandler {
  handle(message: DefaultMessage);
}

export interface RoomDTO {
  name: string;
  users: number[];
  notifications: boolean;
  volume: VolumeLevelModel;
}


interface ChangeUserOnline extends DefaultMessage {
  userId: number;
  sex: SexModel;
  content: number[];
  user: string;
  time: number;
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



interface ModifyMessage {
  edited: number;
  messageId: number;
  userId: number;
  content: string;
  time: number;
  roomId: number;
  id: number;
  deleted: boolean;
}

export interface DeleteMessage extends ModifyMessage {
}

export interface PrintMessage extends ModifyMessage {
  files: Map<number, FileModel>;
  symbol: string;
  giphy: string;
}
