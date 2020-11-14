import {
  ChannelModel,
  CurrentUserInfoModel,
  CurrentUserSettingsModel,
  FileModel,
  Location,
  RoomModel,
  RoomSettingsModel,
  SexModelString,
  UserModel
} from '@/types/model';
import {
  ChannelDto,
  FileModelDto,
  LocationDto,
  RoomDto,
  RoomNoUsersDto,
  SexModelDto,
  UserDto,
  UserProfileDto,
  UserSettingsDto
} from '@/types/dto';
import {
  BooleanDB,
  SexDB
} from '@/types/db';

export function currentUserInfoDtoToModel(userInfo: UserProfileDto): CurrentUserInfoModel {
  return {...userInfo};
}

export function userSettingsDtoToModel(userInfo: UserSettingsDto): CurrentUserSettingsModel {
  return {...userInfo};
}

export function currentUserInfoModelToDto(userInfo: CurrentUserInfoModel): UserProfileDto {
  return {...userInfo};
}

export function convertSex(dto: SexModelDto): SexModelString {
  return dto;
}

export function convertLocation(dto: LocationDto): Location {
  return {...dto};
}

export function convertSexToNumber(m: SexModelString): number {
  if ('Secret' === m) {
    return 0;
  } else if ('Male' === m) {
    return 1;
  } else if ('Female' === m) {
    return 2;
  } else {
    throw Error(`Unknown gender ${m}`);
  }
}

export function getChannelDict(
  {
    channelName,
    channelCreatorId,
    channelId
  }: ChannelDto,
  oldChannel: ChannelModel|null = null
): ChannelModel {
  return {name: channelName, id: channelId!, creator: channelCreatorId, expanded: oldChannel?.expanded ?? false};
}

export function getRoom(r: RoomNoUsersDto): RoomSettingsModel {
  return  {
    channelId: r.channelId,
    p2p: r.p2p,
    id: r.roomId,
    name: r.name,
    notifications: r.notifications,
    volume: r.volume,
    creator: r.roomCreatorId
  }
}

export function getRoomsBaseDict(
    {
      roomId,
      volume,
      channelId,
      notifications,
      roomCreatorId ,
      p2p,
      name,
      users
    }: RoomDto,
    databaseRestoredRoom: RoomModel|null = null
): RoomModel {
  return {
    id: roomId,
    receivingFiles: databaseRestoredRoom ? databaseRestoredRoom.receivingFiles : {},
    sendingFiles: databaseRestoredRoom ? databaseRestoredRoom.sendingFiles : {},
    channelId,
    volume,
    p2p,
    p2pInfo: {
      amountOfActiveConnections: 0
    },
    callInfo: {
      calls: {},
      mediaStreamLink: null,
      showMic: true,
      callContainer: false,
      callActive: false,
      shareScreen: false,
      showVideo: true,
      currentMic: null,
      currentSpeaker: null,
      currentWebcam: null,
      currentMicLevel: 0
    },
    notifications,
    name,
    creator: roomCreatorId,
    messages: databaseRestoredRoom ? databaseRestoredRoom.messages : {},
    newMessagesCount: databaseRestoredRoom ? databaseRestoredRoom.newMessagesCount : 0,
    roomLog: databaseRestoredRoom ? databaseRestoredRoom.roomLog : [],
    changeName: databaseRestoredRoom ? databaseRestoredRoom.changeName : [],
    allLoaded: databaseRestoredRoom ? databaseRestoredRoom.allLoaded : false,
    search: databaseRestoredRoom ? databaseRestoredRoom.search : {
      searchActive: false,
      searchText: '',
      searchedIds: [],
      locked: false
    },
    users
  };
}

export function convertNumberToSex(m: SexDB): SexModelString {
  const newVar: { [id: number]: SexModelString } = {
    0: 'Secret',
    1: 'Male',
    2: 'Female'
  };

  return newVar[m];
}

export function convertSexToString(m: SexDB): SexModelString {
  const newVar: Record<SexDB, SexModelString> = {
    0: 'Secret',
    1: 'Male',
    2: 'Female'
  };

  return newVar[m];
}

export function convertToBoolean(value: BooleanDB): boolean {
  return value === 1;
}

export function convertStringSexToNumber(m: SexModelString): SexDB {
  const newVar: Record<SexModelString, SexDB> =  {
    Secret: 0,
    Male: 1,
    Female: 2
  };
  return newVar[m];
}

export function convertFile(dto: FileModelDto): FileModel {
  return {...dto};
}

export function convertFiles(dto: {[id: number]: FileModelDto}): {[id: number]: FileModel} {
  const res: {[id: number]: FileModel} = {};
  for (const k in dto) {
    res[k] = convertFile(dto[k]);
  }

  return res;
}

export function convertUser(u: UserDto): UserModel {
  const location: Location = u.location ? convertLocation(u.location) : {
    city: null,
    country: null,
    countryCode: null,
    region: null
  };

  return {
    user: u.user,
    id: u.userId,
    sex: convertSex(u.sex),
    location
  };
}
