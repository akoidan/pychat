export enum GrowlType {
  SUCCESS = 'col-success', INFO = 'col-info', ERROR = 'col-error'
}

export  interface GrowlModel {
  id: number;
  html: string;
  type: GrowlType;
}
export type permissions_type = ('audio' | 'video')[]
export interface PlatformUtil {
  askPermissions(...askedPermissions: permissions_type): Promise<void>
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
  suggestions: boolean;
  theme: string;
  logs: boolean;
}

export interface GoogleCaptcha {
  render(div: HTMLElement): void;
  reset(): void;
}

export interface CurrentUserInfoModel {
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

export type SexModelString = 'Secret' | 'Male' | 'Female';

export interface UserModel {
  user: string;
  id: number;
  sex: SexModelString;
  location: Location;
}

export interface Location {
  city: string |null;
  country: string|null;
  countryCode: string|null;
  region: string|null;
}

export  interface FileModel {
  id: number|null;
  url: string|null;
  type: string;
  preview: string|null;
}

export interface UploadProgressModel {
  total: number;
  uploaded: number;
}

export interface MessageTransferInfo {
  upload: UploadProgressModel| null;
  error: string|null;
}

export  interface MessageModel {
  id: number;
  time: number;
  files: {[id: string]: FileModel}| null; // THIS IS STRING, not number!!
  content: string|null;
  symbol: string|null;
  deleted: boolean;
  giphy: string|null;
  edited: number|null;
  roomId: number;
  userId: number;
  transfer: MessageTransferInfo|null;
}

export interface RoomSettingsModel {
  id: number;
  name: string;
  channelId: null | number;
  p2p: boolean;
  notifications: boolean;
  volume: number;
  creator: number;
}

export interface UserDictModel {
  [id: string]: UserModel;
}

export interface RoomDictModel {
  [id: string]: RoomModel;
}

export interface ChannelsDictModel {
  [id: string]: ChannelModel;
}

export interface ChannelsDictUIModel {
  [id: string]: ChannelUIModel;
}

export interface SearchModel {
  searchActive: boolean;
  searchedIds: number[];
  searchText: string;
  locked: boolean;
}

export interface RoomLog {
  userId: number;
  action: 'appeared online' | 'gone offline' | 'joined this room' | 'left this room' | 'been invited to this room';
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
  error: string|null;
}

export enum FileTransferStatus {
  NOT_DECIDED_YET, DECLINED_BY_OPPONENT, DECLINED_BY_YOU, FINISHED, ERROR, IN_PROGRESS
}

export interface ReceivingFile {
  time: number;
  upload: UploadProgressModel;
  status: FileTransferStatus;
  fileName: string;
  opponentWsId: string;
  roomId: number;
  connId: string;
  anchor: string|null;
  error: string|null;
  userId: number;
}

export interface SendingFile {
  time: number;
  fileName: string;
  roomId: number;
  connId: string;
  fileSize: number;
  transfers: { [id: string]: SendingFileTransfer };
}

export interface CallInfoModel {
  mediaStreamLink: string|null;
  connected: boolean;
  userId: number;
  opponentCurrentVoice: number;
}

export interface P2pMessageModel {
  amountOfActiveConnections: number;
}

export interface CallsInfoModel {
  calls: { [id: string]: CallInfoModel };
  callContainer: boolean;
  showMic: boolean;
  currentMicLevel: number; // voice
  mediaStreamLink: string|null;
  currentMic: string|null;
  currentSpeaker: string|null;
  currentWebcam: string|null;
  showVideo: boolean;
  shareScreen: boolean;
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
}

export interface RoomModel extends RoomSettingsModel {
  users: number[];
  callInfo: CallsInfoModel;
  p2pInfo: P2pMessageModel;
  sendingFiles:  { [id: string]: SendingFile };
  receivingFiles:  { [id: string]: ReceivingFile };
  messages: { [id: number]: MessageModel };
  allLoaded: boolean;
  search: SearchModel;
  newMessagesCount: number;
  roomLog: RoomLog[];
  changeName: ChangeRoomName[];
}

export interface IncomingCallModel {
  roomId: number;
  userId: number;
  connId: string;
}
