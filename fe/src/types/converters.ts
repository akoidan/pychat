import {
  CurrentUserInfoModel,
  CurrentUserSettingsModel,
  FileModel,
  RoomModel,
  SexModel,
  UserModel,
  Location,
  SexModelString
} from '@/types/model';
import {
  FileModelDto,
  LocationDto,
  RoomDto,
  SexModelDto,
  UserDto,
  UserProfileDto,
  UserSettingsDto
} from '@/types/dto';
import {BooleanDB, SexDB} from '@/types/db';


export function currentUserInfoDtoToModel(userInfo: UserProfileDto): CurrentUserInfoModel {
  return {...userInfo};
}

export function userSettingsDtoToModel(userInfo: UserSettingsDto): CurrentUserSettingsModel {
  return {...userInfo};
}

export function currentUserInfoModelToDto(userInfo: CurrentUserInfoModel): UserProfileDto {
  return {...userInfo};
}

export function convertSex(dto: SexModelDto): SexModel {
  return <SexModel>SexModel[dto];
}

export function convertLocation(dto: LocationDto): Location {
  return {...dto};
}

export function convertSexToNumber(m: SexModel): number {
  if (SexModel.Secret === m) {
    return 0;
  } else if (SexModel.Male === m) {
    return 1;
  } else if (SexModel.Female === m) {
    return 2;
  } else {
    throw Error(`Unknown gender ${m}`);
  }
}


export function getRoomsBaseDict(
    {
      roomId,
      volume,
      notifications,
      name,
      users
    }: {
      roomId: number,
      volume: number,
      notifications: boolean,
      name: string,
      users: number[]
    },
    oldRoom: RoomModel|null = null
): RoomModel {
  return {
    id: roomId,
    receivingFiles: oldRoom ? oldRoom.receivingFiles : {},
    sendingFiles: oldRoom ? oldRoom.sendingFiles : {},
    volume,
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
      currentMicLevel: 0,
    },
    notifications,
    name,
    messages: oldRoom ? oldRoom.messages : {},
    newMessagesCount: oldRoom ? oldRoom.newMessagesCount : 0,
    changeOnline: oldRoom ? oldRoom.changeOnline : [],
    allLoaded: oldRoom ? oldRoom.allLoaded : false,
    search: oldRoom ? oldRoom.search : {
      searchActive: false,
      searchText: '',
      searchedIds: [],
      locked: false,
    },
    users
  };
}

export function convertNumberToSex(m: SexDB): SexModel {
  return {
    '0': SexModel.Secret,
    '1': SexModel.Male,
    '2': SexModel.Female,
  }[m];
}

export function convertSexToString(m: SexDB): SexModelString {
  let newVar: { [id: number]: SexModelString } = {
    0: 'Secret',
    1: 'Male',
    2: 'Female',
  };
  return newVar[m];
}

export function convertToBoolean(value: BooleanDB): boolean {
  return value === 1;
}

export function convertStringSexToNumber(m: SexModelString): number {
  return {
    'Secret': 0,
    'Male': 1,
    'Female': 2,
  }[m];
}

export function convertFile(dto: FileModelDto): FileModel {
  return {...dto};
}

export function convertFiles(dto: {[id: number]: FileModelDto}): {[id: number]: FileModel} {
  let res: {[id: number]: FileModel} = {};
  for (let k in dto) {
    res[k] = convertFile(dto[k]);
  }
  return res;
}

export function convertUser(u: UserDto): UserModel {
  let location: Location = u.location ? convertLocation(u.location) : {
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
