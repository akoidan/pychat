/**
 * This file should only contain interfaces is used to create Messages to notify.
 * So if you're creating structure that you pass to sub.notify() it should go here.
 * This excludes messages that comes deserialized from websocket or any other network
 */
import {
  ChannelDto,
  RoomDto,
  UserDto
} from '@/ts/types/dto';
import {
  ChangeDeviceType,
  DefaultInMessage,
  HandlerName
} from '@/ts/types/messages/baseMessagesInterfaces';


export interface DefaultInnerSystemMessage<A extends string, H extends HandlerName> extends DefaultInMessage<A, H> {
  allowZeroSubscribers?: boolean; // if true, no errors should be present on handeling this message by sucrcription if nothing was notified
}

export interface PubSetRooms extends DefaultInnerSystemMessage<'init', 'channels'> {
  rooms:  RoomDto[];
  channels: ChannelDto[];
  users: UserDto[];
  online: Record<string, string[]>;
}

export interface InternetAppearMessage extends DefaultInnerSystemMessage<'internetAppear', 'any'> {

}

export interface LoginMessage extends DefaultInnerSystemMessage<'login', 'router'> {
  session: string;
}

export interface LogoutMessage extends DefaultInnerSystemMessage<'logout', 'any'> {
}

export interface RouterNavigateMessage extends DefaultInnerSystemMessage<'navigate', 'router'> {
  to: string;
}

export interface ChangeDevicesMessage extends DefaultInnerSystemMessage<'changeDevices', 'message'>  {
  allowZeroSubscribers: true;
  changeType: ChangeDeviceType;
  roomId: number;
  userId: number|null;
}

export interface ConnectToRemoteMessage extends DefaultInnerSystemMessage<'connectToRemote', HandlerName>  {
  stream: MediaStream|null;
}

export interface RemovePeerConnectionMessage extends DefaultInnerSystemMessage<'removePeerConnection', 'webrtcTransfer:*'> {
  opponentWsId: string;
}

export interface ChangeStreamMessage extends DefaultInnerSystemMessage<'streamChanged', 'peerConnection:*'> {
  newStream: MediaStream;
}

export interface DestroyPeerConnectionMessage extends DefaultInnerSystemMessage<'destroy', 'peerConnection:*'> {
}

export interface SyncP2PMessage extends DefaultInnerSystemMessage<'syncP2pMessage', 'peerConnection:*'> {
  id: number;
}