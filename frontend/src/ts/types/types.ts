import type {
  CallInfoModel,
  ChannelModel,
  CurrentUserInfoModel,
  CurrentUserSettingsModel,
  FileModel,
  FileTransferStatus,
  MessageModel,
  MessageStatus,
  RoomLog,
  RoomModel,
  RoomSettingsModel,
  SendingFileTransfer,
  UploadProgressModel,
  UserModel,
} from "@/ts/types/model";
import type {
  SaveFileResponse,
  SetStateFromStorage,
} from "@/ts/types/dto";


export interface UploadFile {
  key: string;
  file: Blob | File;
}

export type ValueFilterForKey<T extends object, U> = {
  [K in keyof T]: U extends T[K] ? K : never;
}[keyof T];


type StuctureMappedType<K extends string> = Record<K, K>;

const sample: StuctureMappedType<string> = {
  any3: "andy3",
};


export interface UserIdConn {
  connectionId: string;
  userId: number;
}

export interface MessageDataEncode {
  messageContent: string | null;
  files: Record<string, FileModel> | null;
  currSymbol: string;
  tags: Record<string, number>;
}

export enum VideoType {
  AUDIO, VIDEO, SHARE, PAINT,
}

export interface SetDevices {
  microphones: Record<string, string>;
  speakers: Record<string, string>;
  webcams: Record<string, string>;
  roomId: number;
}

export interface MessageSender {
  syncMessage(roomId: number, messageId: number): Promise<void>;

  loadMessages(roomId: number, messageId: number[]): Promise<void>;

  loadUpMessages(roomId: number, count: number): Promise<void>;

  loadThreadMessages(roomId: number, threadId: number): Promise<void>;

  loadUpSearchMessages(roomId: number, count: number, checkIfSet: (found: boolean) => boolean): Promise<void>;

  markMessagesInCurrentRoomAsRead(roomId: number, messageIds: number[]): Promise<void>;
}

export interface JsAudioAnalyzer {
  analyser: any;
  javascriptNode: any;
  prevVolumeValues: any;
  volumeValuesCount: any;
}

export interface SetUploadProgress {
  upload: UploadProgressModel;
  roomId: number;
  messageId: number;
}

export interface SetUploadXHR {
  xhr: XMLHttpRequest;
  roomId: number;
  messageId: number;
}

export interface SetCallOpponent {
  roomId: number;
  opponentWsId: string;
  callInfoModel: CallInfoModel | null;
}

export interface MarkMessageAsRead {
  roomId: number;
  messageId: number;
}

export interface SetOpponentVolume {
  roomId: number;
  opponentWsId: string;
  volume: number;
}

export interface SetOpponentVoice {
  roomId: number;
  opponentWsId: string;
  voice: number;
}

export interface SetOpponentAnchor {
  roomId: number;
  opponentWsId: string;
  anchor: MediaStream;
}

export interface BooleanIdentifier {
  id: number;
  state: boolean;
}

export interface ShareIdentifier {
  id: number;
  type: "desktop" | "paint" | "webcam";
  state: boolean;
}

export interface NumberIdentifier {
  id: number;
  state: number;
}

export interface StringIdentifier {
  id: number;
  state: string;
}

export interface MediaIdentifier {
  id: number;
  media: MediaStream | null;
}

export interface RoomLogEntry {
  roomLog: RoomLog;
  roomIds: number[];
}

export interface SetMessageProgressError {
  messageId: number;
  roomId: number;
  error: string | null;
}

export interface SetFileIdsForMessage {
  messageId: number;
  roomId: number;
  fileIds: SaveFileResponse;
}

export interface RoomMessageIds {
  messageId: number;
  roomId: number;
  newMessageId: number;
}

export interface RoomMessagesIds {
  messagesId: number[];
  roomId: number;
}

export interface MessageSupplier {
  sendRawTextToServer(message: string): boolean;

  getWsConnectionId(): string;
}

export interface IStorage {
  // GetIds(cb: SingleParamCB<object>);
  saveMessages(messages: MessageModel[]): void;

  deleteMessage(id: number, replaceThreadId: number): void;

  setThreadMessageCount(mesageid: number, count: number): void;

  deleteRoom(id: number): void;

  deleteChannel(id: number): void;

  saveMessage(m: MessageModel): void;

  updateRoom(m: RoomSettingsModel): void;

  updateFileIds(m: SetFileIdsForMessage): void;

  setRooms(rooms: RoomSettingsModel[]): void;

  setChannels(channels: ChannelModel[]): void;

  saveRoom(room: RoomModel): void;

  saveChannel(room: ChannelModel): void;

  setUserProfile(user: CurrentUserInfoModel): void;

  setUserSettings(settings: CurrentUserSettingsModel): void;

  saveRoomUsers(ru: SetRoomsUsers): void;

  setUsers(users: UserModel[]): void;

  setMessagesStatus(messagesIds: number[], status: MessageStatus): void;

  saveUser(users: UserModel): void;

  clearStorage(): void;

  clearMessages(): void;

  connect(): Promise<SetStateFromStorage | null>;

  // GetRoomHeaderId(roomId: number, cb: SingleParamCB<number>);
  setRoomHeaderId(roomId: number, value: number): void;

  markMessageAsSent(messagesId: number[]): void;
}

export interface PostData {
  url: string;
  params?: Record<string, Blob | boolean | number | string | null>;
  formData?: FormData;
  isJsonEncoded?: boolean;
  isJsonDecoded?: boolean;
  checkOkString?: boolean;
  errorDescription?: string;

  process?(R: XMLHttpRequest): void;
}

export interface GetData {
  url: string;
  isJsonDecoded?: boolean;
  checkOkString?: boolean;
  baseUrl?: string;
  skipAuth?: boolean;

  process?(R: XMLHttpRequest): void;
}

export interface AddSendingFileTransfer {
  roomId: number;
  connId: string;
  transferId: string;
  transfer: SendingFileTransfer;
}

export interface SetReceivingFileStatus {
  roomId: number;
  connId: string;
  status: FileTransferStatus;
  error?: string | null;
  anchor?: string;
}

export type ConnectionStatus =
  "closed"
  | "new";

interface SetSendingFileBase {
  roomId: number;
  connId: string;
  transfer: string;
}

export interface SetSendingFileUploaded extends SetSendingFileBase {
  uploaded: number;
}

export interface SetReceivingFileUploaded {
  roomId: number;
  connId: string;
  uploaded: number;
}

export interface SetSendingFileStatus extends SetSendingFileBase {
  status: FileTransferStatus;
  error: string | null;
}

export interface MessagesLocation {
  roomId: number;
  messages: MessageModel[];
}

export interface AddMessagesDTO extends MessagesLocation {
  syncingThreadMessageRequired?: true;
}

export interface LiveConnectionLocation {
  roomId: number;
  connection: string;
}

export interface PrivateRoomsIds {
  userRooms: Record<number, number>;
  roomUsers: Record<number, number>;
}

export interface SetRoomsUsers {
  roomId: number;
  users: number[];
}

export interface RemoveMessageProgress {
  messageId: number;
  roomId: number;
}

export interface SetMessageProgress extends RemoveMessageProgress {
  uploaded: number;
}

export interface SetSearchStateTo {
  roomId: number;
  lock: boolean;
}

export interface SetSearchTextTo {
  roomId: number;
  searchText: string;
}

export enum IconColor {
  SUCCESS = "success", ERROR = "error", WARN = "warn", NOT_SET = "",
}

export interface SessionHolder {
  session: string | null;
}
