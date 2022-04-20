import type {
  ChannelModel,
  CurrentUserInfoModel,
  CurrentUserInfoWoImage,
  CurrentUserSettingsModel,
  FileModel,
  Location,
  MessageModel,
  RoomModel,
  RoomSettingsModel,
  UserModel,
} from "@/ts/types/model";
import type {
  ChannelDto,
  FileModelDto,
  LocationDto,
  MessageModelDto,
  RoomDto,
  RoomNoUsersDto,
  UserDto,
  UserProfileDtoWoImage,
  UserSettingsDto,
} from "@/ts/types/shared/dto";
import type {
  BooleanDB,
  SexDB,
} from "@/ts/types/db";
import type {MessageP2pDto} from "@/ts/types/messages/p2pDto";
import {
  Gender,
  MessageStatus
} from "@/ts/types/shared/enums";

export function currentUserInfoDtoToModel(userInfo: UserProfileDtoWoImage): CurrentUserInfoWoImage {
  return {...userInfo};
}

export function userSettingsDtoToModel(userInfo: UserSettingsDto): CurrentUserSettingsModel {
  return {...userInfo};
}

export function currentUserInfoModelToDto(userInfo: CurrentUserInfoModel): UserProfileDtoWoImage {
  return {...userInfo};
}

export function convertSex(dto: Gender): Gender {
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

export function getChannelDict(
  {
    name,
    creatorId,
    id,
  }: ChannelDto,
  oldChannel: ChannelModel | null = null,
): ChannelModel {
  return {
    name,
    id,
    creatorId,
    expanded: oldChannel?.expanded ?? false,
  };
}

export function getRoom(r: RoomNoUsersDto): RoomSettingsModel {
  return {
    channelId: r.channelId,
    p2p: r.p2p,
    id: r.id,
    name: r.name,
    isMainInChannel: r.isMainInChannel,
    notifications: r.notifications,
    volume: r.volume,
    creatorId: r.creatorId,
  };
}

export function getRoomsBaseDict(
  {
    id,
    volume,
    channelId,
    isMainInChannel,
    notifications,
    creatorId,
    p2p,
    name,
    users,
  }: RoomDto,
  databaseRestoredRoom: RoomModel | null = null,
): RoomModel {
  return {
    id,
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
    creatorId,
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

export function convertToBoolean(value: BooleanDB): boolean {
  return value === 1;
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
  let status: MessageStatus = MessageStatus.RECEIVED;
  if (m.status === MessageStatus.READ) {
    status = MessageStatus.READ;
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
    username: u.username,
    id: u.id,
    thumbnail: u.thumbnail,
    lastTimeOnline: u.lastTimeOnline,
    sex: convertSex(u.sex),
    location: convertLocation(location),
  };
}
