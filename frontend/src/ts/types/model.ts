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
  sendLogs: boolean;
  showWhenITyping: boolean;
  suggestions: boolean;
  theme: string;
  logs: LogLevel;
}

export interface GoogleCaptcha {
  render(div: HTMLElement): void;

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
  image: string | null;
}

export interface CurrentUserInfoWoImage {
  userId: number;
  user: string;
  name: string;
  city: string;
  surname: string;
  email: string;
  birthday: string;
  contacts: string;
  sex: SexModelString;
}

export type SexModelString =
  "Female"
  | "Male"
  | "Secret";

export interface UserModel {
  user: string;
  id: number;
  sex: SexModelString;
  image: string;
  lastTimeOnline: number;
  location: Location;
}

export interface Location {
  city: string | null;
  country: string | null;
  countryCode: string | null;
  region: string | null;
}

/*
 * F - file
 * g - giphy
 * i - image
 * v - video
 * a - audio
 * m - media (same as video, but you need to click on image, in order to load video)
 */
export type BlobType =
  "a"
  | "f"
  | "g"
  | "i"
  | "m"
  | "v";

export interface FileModel {
  url: string | null;
  type: BlobType;
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
  xhr: XMLHttpRequest | null;
}

export type MessageStatus =
  "on_server"
  | "read"
  | "received"
  | "sending";

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
  status: MessageStatus;
  edited: number;
  roomId: number;
  userId: number;
  transfer: MessageTransferInfo | null;
}

export interface RoomSettingsModel {
  id: number;
  name: string;
  channelId: number | null;
  p2p: boolean;
  isMainInChannel: boolean;
  notifications: boolean;
  volume: number;
  creator: number;
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
  creator: number;
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
