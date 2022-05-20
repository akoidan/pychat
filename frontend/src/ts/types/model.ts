import {Gender} from "@common/model/enum/gender";
import {ImageType} from "@common/model/enum/image.type";
import {MessageStatus} from "@common/model/enum/message.status";
import type {LogLevel} from "lines-logger";


export enum GrowlType {
  SUCCESS = "col-success", INFO = "col-info", ERROR = "col-error",
}

export interface GrowlModel {
  id: number;
  html: string;
  type: GrowlType;
}

export type permissions_type = ("audio" | "video")[];

export interface PlatformUtil {
  askPermissions(...askedPermissions: permissions_type): Promise<void>;
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
  showWhenITyping: boolean;
  suggestions: boolean;
  theme: string;
  logs: LogLevel;
}

export interface GoogleCaptcha {
  render(div: HTMLElement, options: any): void;

  reset(): void;
}

export interface PastingTextAreaElement {
  elType: "blob";
  content: string;
  roomId: number;
  editedMessageId: number | null;
  openedThreadId: number | null;
}

export interface CurrentUserInfoModel extends CurrentUserInfoWoImage {
  thumbnail: string | null;
}

export interface CurrentUserInfoWoImage {
  id: number;
  username: string;
  name: string;
  city: string;
  surname: string;
  email: string;
  birthday: Date;
  contacts: string;
  sex: Gender;
}


export interface UserModel {
  username: string;
  id: number;
  sex: Gender;
  thumbnail: string;
  lastTimeOnline: number;
  location: Location;
}

export interface Location {
  city: string | null;
  country: string | null;
  countryCode: string | null;
  region: string | null;
}

export interface FileModel {
  url: string | null;
  type: ImageType;
  name?: string; // TODO
  serverId: number | null;
  previewFileId: number | null;
  fileId: number | null;
  preview: string | null;
  sending: boolean;
}

export interface UploadProgressModel {
  total: number;
  uploaded: number;
}

export interface MessageTransferInfo {
  upload: UploadProgressModel | null;
  error: string | null;
  abortFn: (() => void) | null;
}

export interface MessageModel {
  id: number;
  time: number;
  parentMessage: number | null;
  files: Record<string, FileModel> | null; // THIS IS STRING, not number!!
  content: string | null;
  tags: Record<string, number>; // User id
  isHighlighted: boolean; // If not read
  isEditingActive: boolean; // If textarea is opened for this message to edit it
  isThreadOpened: boolean; // If thread is opened for this message
  symbol: string | null;
  threadMessagesCount: number;
  deleted: boolean;
  status: MessageStatusModel;
  edited: number;
  roomId: number;
  userId: number;
  transfer: MessageTransferInfo | null;
}

export enum MessageStatusInner {
  SENDING = "SENDING",
}
export type MessageStatusModel = MessageStatus | MessageStatusInner;


export interface RoomSettingsModel {
  id: number;
  name: string;
  channelId: number | null;
  p2p: boolean;
  isMainInChannel: boolean;
  notifications: boolean;
  volume: number;
  creatorId: number;
}

export type UserDictModel = Record<string, UserModel>;

export type RoomDictModel = Record<string, RoomModel>;

export type ChannelsDictModel = Record<string, ChannelModel>;

export type ChannelsDictUIModel = Record<string, ChannelUIModel>;

export interface SearchModel {
  searchActive: boolean; // If true search panel is shown
  messages: Record<number, MessageModel>;
  searchText: string;
  locked: boolean; // If true, no more messages with this search is available from the server
}

export interface RoomLog {
  userId: number;
  action: "appeared online" | "been invited to this room" | "gone offline" | "joined this room" | "left this room";
  time: number;
}

export interface ChangeRoomName {
  oldName: string;
  newName: string;
  time: number;
}

export interface SendingFileTransfer {
  status: FileTransferStatus;
  userId: number;
  upload: UploadProgressModel;
  error: string | null;
}

export enum FileTransferStatus {
  NOT_DECIDED_YET, DECLINED_BY_OPPONENT, DECLINED_BY_YOU, FINISHED, ERROR, IN_PROGRESS,
}

export interface ReceivingFile {
  time: number;
  upload: UploadProgressModel;
  status: FileTransferStatus;
  fileName: string;
  threadId: number | null;
  opponentWsId: string;
  roomId: number;
  connId: string;
  anchor: string | null;
  error: string | null;
  userId: number;
}

export interface SendingFile {
  time: number;
  fileName: string;
  threadId: number | null;
  roomId: number;
  connId: string;
  fileSize: number;
  transfers: Record<string, SendingFileTransfer>;
}

export interface CallInfoModel {
  mediaStreamLink: string | null;
  connected: boolean;
  userId: number;
  opponentCurrentVoice: number;
}

export interface P2pMessageModel {
  liveConnections: string[];
}

export interface CallsInfoModel {
  calls: Record<string, CallInfoModel>;
  callActiveButNotJoinedYet: boolean;
  showMic: boolean;
  currentMicLevel: number; // Voice
  mediaStreamLink: string | null;
  currentMic: string | null;
  currentSpeaker: string | null;
  currentWebcam: string | null;
  showVideo: boolean;
  shareScreen: boolean;
  sharePaint: boolean;
  callActive: boolean;
}

export interface ChannelModel {
  expanded: boolean;
  id: number;
  name: string;
  creatorId: number;
}

export interface ChannelUIModel extends ChannelModel {
  rooms: RoomModel[];
  mainRoom: RoomModel;
}

export interface RoomModel extends RoomSettingsModel {
  users: number[];
  callInfo: CallsInfoModel;
  p2pInfo: P2pMessageModel;
  sendingFiles: Record<string, SendingFile>;
  receivingFiles: Record<string, ReceivingFile>;
  messages: Record<number, MessageModel>;
  allLoaded: boolean;
  search: SearchModel;
  usersTyping: Record<number, number>;
  roomLog: RoomLog[];
  changeName: ChangeRoomName[];
}

export interface IncomingCallModel {
  roomId: number;
  userId: number;
  connId: string;
}
