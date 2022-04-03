import type {
  ChannelModel,
  CurrentUserInfoModel,
  CurrentUserInfoWoImage,
  CurrentUserSettingsModel,
  FileModel,
  Location,
  MessageModel,
  MessageStatus,
  RoomModel,
  RoomSettingsModel,
  SexModelString,
  UserModel,
} from "@/ts/types/model";
import type {
  ChannelDto,
  FileModelDto,
  LocationDto,
  MessageModelDto,
  RoomDto,
  RoomNoUsersDto,
  SexModelDto,
  UserDto,
  UserProfileDtoWoImage,
  UserSettingsDto,
} from "@/ts/types/dto";
import type {
  BooleanDB,
  SexDB,
} from "@/ts/types/db";
import type {MessageP2pDto} from "@/ts/types/messages/p2pDto";

export function currentUserInfoDtoToModel(userInfo: UserProfileDtoWoImage): CurrentUserInfoWoImage {
  return {...userInfo};
}

export function userSettingsDtoToModel(userInfo: UserSettingsDto): CurrentUserSettingsModel {
  return {...userInfo};
}

export function currentUserInfoModelToDto(userInfo: CurrentUserInfoModel): UserProfileDtoWoImage {
  return {...userInfo};
}

export function convertSex(dto: SexModelDto): SexModelString {
  return dto;
}

export function convertLocation(dto: LocationDto | null): Location {
  if (!dto) {
    return {
      city: null,
      country: null,
      countryCode: null,
      region: null,
    };
  }
  return {...dto};
}

export function convertSexToNumber(m: SexModelString): number {
  if (m === "Secret") {
    return 0;
  } else if (m === "Male") {
    return 1;
  } else if (m === "Female") {
    return 2;
  }
  throw Error(`Unknown gender ${m}`);
}

export function getChannelDict(
  {
    channelName,
    channelCreatorId,
    channelId,
  }: ChannelDto,
  oldChannel: ChannelModel | null = null,
): ChannelModel {
  return {
    name: channelName,
    id: channelId,
    creator: channelCreatorId,
    expanded: oldChannel?.expanded ?? false,
  };
}

export function getRoom(r: RoomNoUsersDto): RoomSettingsModel {
  return {
    channelId: r.channelId,
    p2p: r.p2p,
    id: r.roomId,
    name: r.name,
    isMainInChannel: r.isMainInChannel,
    notifications: r.notifications,
    volume: r.volume,
    creator: r.roomCreatorId,
  };
}

export function getRoomsBaseDict(
  {
    roomId,
    volume,
    channelId,
    isMainInChannel,
    notifications,
    roomCreatorId,
    p2p,
    name,
    users,
  }: RoomDto,
  databaseRestoredRoom: RoomModel | null = null,
): RoomModel {
  return {
    id: roomId,
    receivingFiles: databaseRestoredRoom ? databaseRestoredRoom.receivingFiles : {},
    sendingFiles: databaseRestoredRoom ? databaseRestoredRoom.sendingFiles : {},
    channelId,
    volume,
    p2p,
    isMainInChannel,
    usersTyping: {},
    p2pInfo: {
      liveConnections: [],
    },
    callInfo: {
      calls: {},
      callActiveButNotJoinedYet: false,
      mediaStreamLink: null,
      showMic: true,
      sharePaint: false,
      callActive: false,
      shareScreen: false,
      showVideo: false,
      currentMic: null,
      currentSpeaker: null,
      currentWebcam: null,
      currentMicLevel: 0,
    },
    notifications,
    name,
    creator: roomCreatorId,
    messages: databaseRestoredRoom ? databaseRestoredRoom.messages : {},
    roomLog: databaseRestoredRoom ? databaseRestoredRoom.roomLog : [],
    changeName: databaseRestoredRoom ? databaseRestoredRoom.changeName : [],
    allLoaded: databaseRestoredRoom ? databaseRestoredRoom.allLoaded : false,
    search: databaseRestoredRoom ? databaseRestoredRoom.search : {
      searchActive: false,
      searchText: "",
      messages: [],
      locked: false,
    },
    users,
  };
}

export function convertNumberToSex(m: SexDB): SexModelString {
  const newVar: Record<number, SexModelString> = {
    0: "Secret",
    1: "Male",
    2: "Female",
  };

  return newVar[m];
}

export function convertSexToString(m: SexDB): SexModelString {
  const newVar: Record<SexDB, SexModelString> = {
    0: "Secret",
    1: "Male",
    2: "Female",
  };

  return newVar[m];
}

export function convertToBoolean(value: BooleanDB): boolean {
  return value === 1;
}

export function convertStringSexToNumber(m: SexModelString): SexDB {
  const newVar: Record<SexModelString, SexDB> = {
    Secret: 0,
    Male: 1,
    Female: 2,
  };
  return newVar[m];
}


export function messageModelToP2p(m: MessageModel): MessageP2pDto {
  return {
    content: m.content,
    deleted: m.deleted,
    edited: m.edited,
    files: {},
    id: m.id,
    status: m.status,
    parentMessage: m.parentMessage,
    symbol: m.symbol,
    timeAgo: Date.now() - m.time,
    userId: m.userId,
  };
}


export function convertFiles(dtos: Record<number, FileModelDto>): Record<number, FileModel> {
  const res: Record<number, FileModel> = {};
  for (const k in dtos) {
    const dto = dtos[k];
    res[k] = {
      fileId: null,
      serverId: dto.id,
      sending: false,
      previewFileId: null,
      preview: dto.preview,
      type: dto.type,
      url: dto.url,
    };
  }
  return res;
}

export function convertMessageModelDtoToModel(message: MessageModelDto, oldMessage: MessageModel | null, timeConverter: (time: number) => number): MessageModel {
  if (message.threadMessagesCount === undefined) {
    throw Error("WTF");
  }
  return {
    id: message.id,
    time: timeConverter(message.time),
    isHighlighted: oldMessage ? oldMessage.isHighlighted : false,
    files: message.files ? convertFiles(message.files) : null,
    content: message.content || null,
    symbol: message.symbol || null,
    threadMessagesCount: message.threadMessagesCount,
    edited: message.edited,
    isEditingActive: oldMessage ? oldMessage.isEditingActive : false,
    isThreadOpened: oldMessage ? oldMessage.isThreadOpened : false,
    roomId: message.roomId,
    userId: message.userId,
    transfer: null,
    tags: {...message.tags}, // Prevent modifying original object by vuex
    parentMessage: message.parentMessage,
    status: message.status,
    deleted: message.deleted || false,
  };
}

export function p2pMessageToModel(m: MessageP2pDto, roomId: number): MessageModel {
  let status: MessageStatus = "received";
  if (m.status === "read") {
    status = "read";
  }
  return {
    content: m.content,
    deleted: m.deleted,
    edited: m.edited,
    parentMessage: m.parentMessage,
    files: {},
    tags: {}, // TODO
    threadMessagesCount: 0, // TODO
    isThreadOpened: false,
    isEditingActive: false,
    id: m.id,
    symbol: m.symbol,
    time: Date.now() - m.timeAgo,
    userId: m.userId,
    status,
    roomId,
    isHighlighted: false,
    transfer: null,
  };
}

export function convertUser(u: UserDto, location: LocationDto | null): UserModel {
  return {
    user: u.user,
    id: u.userId,
    image: u.userImage,
    lastTimeOnline: u.lastTimeOnline,
    sex: convertSex(u.sex),
    location: convertLocation(location),
  };
}
