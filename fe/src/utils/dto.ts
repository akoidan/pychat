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

export interface AddOnlineUser extends DefaultMessage {
  content: number[];
  sex: SexModel;
  user: string;
  userId: number;
}

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