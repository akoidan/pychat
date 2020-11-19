import {
  CallInfoModel,
  ChannelModel,
  CurrentUserInfoModel,
  CurrentUserSettingsModel,
  FileModel,
  FileTransferStatus,
  MessageModel,
  RoomLog,
  RoomModel,
  RoomSettingsModel,
  SearchModel,
  SendingFileTransfer,
  UploadProgressModel,
  UserModel
} from '@/ts/types/model';
import {
  MessageModelDto,
  SetStateFromStorage
} from '@/ts/types/dto';


export interface UploadFile {
   key: string;
   file: File|Blob;
}

export type ValueFilterForKey<T extends object, U> = {
  [K in keyof T]: U extends T[K] ? K : never;
}[keyof T];





type StuctureMappedType<K extends string> = Record<K, K>;

const sample: StuctureMappedType<string> = {
  'any3': "andy3"
}


export interface UserIdConn {
  connectionId: string;
  userId: number;
}



export interface MessageDataEncode {
  messageContent: string|null;
  files:  Record<string, FileModel>| null;
  currSymbol: string;
}

export enum VideoType {
  AUDIO, VIDEO, SHARE
}

export interface SetDevices {
  microphones: { [id: string]: string };
  speakers: { [id: string]: string };
  webcams: { [id: string]: string };
}

export interface MessageSender {
  syncMessage(roomId: number, messageId: number):  Promise<void>;
  addMessages(roomId: number, messages: MessageModelDto[]): void;
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

export interface SetCallOpponent {
  roomId: number;
  opponentWsId: string;
  callInfoModel: CallInfoModel|null;
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
  media: MediaStream|null;
}

export interface RoomLogEntry {
  roomLog: RoomLog;
  roomIds: number[];
}

export interface SetMessageProgressError {
  messageId: number;
  roomId: number;
  error: string|null;
}

export interface SetFileIdsForMessage {
  messageId: number;
  roomId: number;
  fileIds: {symbol: string; id: number}[];
}

export interface RemoveSendingMessage {
  messageId: number;
  roomId: number;
}

export interface MessageSupplier {
  sendRawTextToServer(message: string): boolean;
  getWsConnectionId(): string;
}

export  interface IStorage {
  // getIds(cb: SingleParamCB<object>);
  saveMessages(messages: MessageModel[]): void;
  deleteMessage(id: number): void;
  deleteRoom(id: number): void;
  deleteChannel(id: number): void;
  saveMessage(m: MessageModel): void;
  updateRoom(m: RoomSettingsModel): void;
  setRooms(rooms: RoomSettingsModel[]): void;
  setChannels(channels: ChannelModel[]): void;
  saveRoom(room: RoomModel): void;
  saveChannel(room: ChannelModel): void;
  setUserProfile(user: CurrentUserInfoModel): void;
  setUserSettings(settings: CurrentUserSettingsModel): void;
  saveRoomUsers(ru: SetRoomsUsers): void;
  setUsers(users: UserModel[]): void;
  getMinMessageId(): number;
  getAllTree(): Promise<StorageData|null>;
  saveUser(users: UserModel): void;
  clearStorage(): void;
  clearMessages(): void;
  connect(): Promise<boolean>;
  // getRoomHeaderId(roomId: number, cb: SingleParamCB<number>);
  setRoomHeaderId(roomId: number, value: number): void;
}

export interface  PostData<T> {
  url: string;
  params?: {[id: string]: string|Blob|null|number|boolean};
  formData?: FormData;
  isJsonEncoded?: boolean;
  isJsonDecoded?: boolean;
  checkOkString?: boolean;
  errorDescription?: string;
  requestInterceptor?(a: XMLHttpRequest): void;
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
  error?: string|null;
  anchor?: string;
}

export type ConnectionStatus = 'new' | 'closed';

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
  error: string|null;
}

export interface StorageData {
  setRooms: SetStateFromStorage;
  sendingMessages: MessageModel[];
}

export interface MessagesLocation {
  roomId: number;
  messages: MessageModel[];
}

export interface PrivateRoomsIds {
  userRooms: {[id: number]: number};
  roomUsers: {[id: number]: number};
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

export interface SetSearchTo {
  roomId: number;
  search: SearchModel;
}

export enum IconColor {
  SUCCESS = 'success', ERROR = 'error', WARN = 'warn', NOT_SET = ''
}

export interface SessionHolder {
  session: string|null;
}
