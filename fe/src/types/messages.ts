import {FileModelDto, MessageModelDto, RoomDto, SexModelDto, UserDto, UserProfileDto, UserSettingsDto} from './dto';
import {FileModel} from './model';

export interface DefaultMessage {
  action: string;
  handler: string;
  messageId?: number;
  cbBySender?: string;
}

export interface WebRtcDefaultMessage extends DefaultMessage {
  connId: string;
}

export interface WebRtcSetConnectionIdMessage extends WebRtcDefaultMessage {
  time: number;
}

export interface SetWsIdMessage extends DefaultMessage {
  rooms:  RoomDto[];
  users: UserDto[];
  online: number[];
  opponentWsId: string;
  userImage: string;
  userInfo: UserProfileDto;
  userSettings: UserSettingsDto;
}


export interface OfferFileContent extends BrowserBase {
  size: number;
  name: string;
}

export interface BrowserBase {
  browser: string;
}

export interface OfferFile extends WebRtcDefaultMessage {
  content: OfferFileContent;
  opponentWsId: string;
  roomId: number;
  userId: number;
  time: number;
}

export interface SetSettingsMessage extends DefaultMessage {
  content: UserSettingsDto;
}
export interface SetUserProfileMessage extends DefaultMessage {
  content: UserProfileDto;
}

export interface ReplyFileMessage extends WebRtcDefaultMessage {
  content: BrowserBase;
  opponentWsId: string;
  userId: number;
}

export interface DestroyFileConnectionMessage extends DefaultMessage {
  content: string;
}

export interface UserProfileChangedMessage extends DefaultMessage, UserDto {

}

export interface ViewUserProfileDto extends UserProfileDto {
  image: string;
}

export interface PingMessage extends DefaultMessage {
  time: string;
}

export interface SetProfileImageMessage extends DefaultMessage {
  content: string;
}

interface ChangeUserOnline extends DefaultMessage, UserDto {
  content: number[];
  time: number;
}

export interface DeleteRoomMessage extends DefaultMessage {
  roomId: number;
}

export interface AddOnlineUserMessage extends ChangeUserOnline {}
export interface RemoveOnlineUserMessage extends ChangeUserOnline {}


interface RoomExistedBefore {
  inviteeUserId: number[];
}

interface NewRoom extends DefaultMessage {
  inviterUserId: number;
  roomId: number;
  time: number;
  users: number[];
}
export interface AddRoomBase extends  NewRoom {
  name: string;
  notifications: boolean;
  volume: number;
}

export interface AcceptFileContent {
  received: number;
}

export interface AcceptFileMessage extends DefaultMessage {
 content: AcceptFileContent;
}


export interface InviteUserMessage extends NewRoom, RoomExistedBefore {
}
export interface AddInviteMessage extends AddRoomBase, RoomExistedBefore {
}
export interface AddRoomMessage extends AddRoomBase {
}

export interface LeaveUserMessage extends DefaultMessage {
  roomId: number;
  userId: number;
  users: number[];
}


export interface LoadMessages extends DefaultMessage {
  content: MessageModelDto[];
  roomId: number;
}

export interface GrowlMessage extends DefaultMessage {
  content: string;
}

export interface DeleteMessage extends DefaultMessage {
  roomId: number;
  id: number;
  edited: number;
}


export interface EditMessage extends DeleteMessage {
  userId: number;
  content: string;
  time: number;
  files: {[id: number]: FileModelDto};
  symbol: string;
  giphy: string;
  deleted: boolean;
}
