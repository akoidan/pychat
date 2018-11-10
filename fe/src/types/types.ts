import {
  FileTransferStatus,
  ChangeOnline,
  CurrentUserInfoModel,
  CurrentUserSettingsModel,
  FileModel,
  MessageModel, ReceivingFile,
  RoomModel,
  RoomSettingsModel,
  SearchModel, SendingFile,
  UploadProgressModel,
  UserModel, SendingFileTransfer, CallInfoModel
} from './model';
import {RoomDto, SetRooms, UserDto} from './dto';
import {DefaultMessage} from './messages';


export interface UploadFile {
   type: string;
   symbol: string;
   file: File;
}

export interface IMessageHandler {
  handle(message: DefaultMessage);
}

export interface ChangeStreamMessage extends DefaultMessage{
  newStream: MediaStream;
  oldStream: MediaStream;
}

export interface MessageDataEncode {
  messageContent: string;
  files: UploadFile[];
  fileModels: { [id: number]: FileModel };
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

export interface SetCallToState {
  roomId: number;
  state: number;
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
  callInfoModel: CallInfoModel;
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
  anchor: string;
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

export interface RemovePeerConnection extends DefaultMessage {
  opponentWsId: string;
}

export interface ChangeOnlineEntry {
  changeOnline: ChangeOnline;
  roomIds: number[];
}

export interface SetMessageProgressError {
  messageId: number;
  roomId: number;
  error: string;
}

export interface RemoveSendingMessage {
  messageId: number;
  roomId: number;
}

export  interface IStorage {
  // getIds(cb: SingleParamCB<object>);
  saveMessages(messages: MessageModel[]);
  deleteMessage(id: number);
  deleteRoom(id: number);
  saveMessage(m: MessageModel);
  updateRoom(m: RoomSettingsModel);
  setRooms(rooms: RoomSettingsModel[]);
  saveRoom(room: RoomModel);
  setUserProfile(user: CurrentUserInfoModel);
  setUserSettings( settings: CurrentUserSettingsModel);
  saveRoomUsers(ru: SetRoomsUsers);
  setUsers(users: UserModel[]);

  getAllTree(): Promise<StorageData>;
  saveUser(users: UserModel);
  clearStorage();
  clearMessages();
  connect();
  // getRoomHeaderId(roomId: number, cb: SingleParamCB<number>);
  setRoomHeaderId(roomId: number, value: number);
}

export interface PostData<T> {
  url: string;
  params?: object;
  cb: ErrorCB<T>;
  formData?: FormData;
  isJsonEncoded?: boolean;
  isJsonDecoded?: boolean;
  process?: Function;
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
  error?: string;
  anchor?: string;
}

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
  error?: string;
}

export interface StorageData {
  setRooms: SetRooms;
  sendingMessages: MessageModel[];
}

export interface MessagesLocation {
  roomId: number;
  messages: MessageModel[];
}

export interface PrivateRoomsIds {
  userRooms: {};
  roomUsers: {};
}
export interface SetRoomsUsers {
  roomId: number;
  users: number[];
}

export interface RemoveMessageProgress {
  messageId: number;
  roomId: number;
}

export interface PubSetRooms extends DefaultMessage {
  rooms:  RoomDto[];
  users: UserDto[];
  online: number[];
}

export interface SetMessageProgress extends RemoveMessageProgress {
  uploaded: number;
}

export interface SetSearchTo {
  roomId: number;
  search: SearchModel;
}

export interface AddMessagePayload {
  index: number;
  message: MessageModel;
}

export enum IconColor {
  SUCCESS = 'success', ERROR = 'error', WARN = 'warn', NOT_SET = ''
}

export interface SmileyStructure {
  alt: string;
  src: string;
}


export interface SessionHolder {
  session: string;
}