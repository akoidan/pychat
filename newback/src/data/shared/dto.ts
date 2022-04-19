

export declare type LogLevel =
  "debug"
  | "disable"
  | "error"
  | "info"
  | "log_raise_error"
  | "log_with_warnings"
  | "trace"
  | "warn";

export interface UserSettingsDto {
  embeddedYoutube: boolean;
  highlightCode: boolean;
  incomingFileCallSound: boolean;
  messageSound: boolean;
  onlineChangeSound: boolean;
  showWhenITyping: boolean;
  suggestions: boolean;
  logs: LogLevel;
  theme: string;
}


export interface RoomNoUsersDto {
  channelId: number | null;
  notifications: boolean;
  p2p: boolean;
  volume: number;
  isMainInChannel: boolean;
  id: number;
  name: string;
  creatorId: number;
}

export interface UserProfileDto extends UserProfileDtoWoImage {
  thumbnail: string;
}


export interface LocationDto {
  city: string;
  country: string;
  countryCode: string;
  region: string;
}


export interface ChannelDto {
  name: string;
  id: number;
  creatorId: number;
}

export interface RoomDto extends RoomNoUsersDto {
  users: number[];
}


export interface FileModelDto {
  url: string;
  id: number;
  type: ImageType;
  preview: string;
}



export interface MessageModelDto {
  id: number;
  time: number;
  parentMessage: number;
  files?: Record<number, FileModelDto>;
  tags: Record<number, number>;
  content: string;
  status: MessageStatus;
  symbol?: string;
  deleted?: boolean;
  threadMessagesCount: number;
  edited: number;
  roomId: number;
  userId: number;
}


export interface UserDto {
  username: string;
  id: number;
  thumbnail: string;
  lastTimeOnline: number;
  sex: Gender;
}


export interface UserProfileDtoWoImage {
  username: string;
  name: string;
  city: string;
  surname: string;
  email: string;
  birthday: Date;
  contacts: string;
  sex: Gender;
  id: number;
}




export interface ChangeUserOnlineBase {
  online: Record<number, string[]>;
  userId: number;
  lastTimeOnline: number;
  time: number;
}




export interface AcceptFileContent {
  received: number;
}

export interface ReplyWebRtc extends WebRtcDefaultMessage, OpponentWsId {
  content: BrowserBase;
  userId: number;
}

export interface NewRoom {
  inviterUserId: number;
  time: number;
}

export interface RoomExistedBefore {
  inviteeUserId: number[];
}

export interface AddRoomBase extends NewRoom, Omit<ChannelDto, "channelId">, RoomDto {
}

export interface OpponentWsId {
  opponentWsId: string;
}

export interface WebRtcDefaultMessage {
  connId: string;
}

export interface OfferFileContent extends BrowserBase {
  size: number;
  name: string;
}

export type ChangeDeviceType =
  "i_deleted"
  | "invited"
  | "room_created"
  | "someone_joined"
  | "someone_left";
export type ChangeOnlineType =
  "appear_online"
  | "gone_offline";

export interface BrowserBase {
  browser: string;
}

export interface CallBackMessage {
  // Request to send response with this callback id
  cbId?: number;
}


export interface ResolveCallbackId {
  resolveCbId?: number; // If this callback id is present, resolve it
}

export interface IMessageHandler {
  handle(message: DefaultInMessage<string, HandlerName>): void;

  getHandler<H extends HandlerName, A extends string>(message: DefaultInMessage<A, H>): HandlerType<A, H> | undefined;
}

export type CallStatus =
  "accepted"
  | "not_inited"
  | "received_offer"
  | "sent_offer";


/** WsInMessages.ts */
/**
 * This file should only contain structures created by server. Only BE -> FE by websockets
 * and processed by MessageHandler
 */


export interface MessagesResponseMessage {
  content: MessageModelDto[];
}

export interface SyncHistoryWsInMessage extends MessagesResponseMessage {
  readMessageIds: number[];
  receivedMessageIds: number[];
}



export interface GiphyDto {
  webp: string;
  url: string;
  symbol: string;
}

