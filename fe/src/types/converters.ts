import {CurrentUserInfoModel, CurrentUserSettingsModel, FileModel, RoomModel, SexModel, UserModel} from './model';
import {FileModelDto, RoomDto, SexModelDto, UserDto, UserProfileDto, UserSettingsDto} from './dto';


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

export function convertSexToNumber(m: SexModel): number {
  if (SexModel.Secret === m) {
    return 0;
  } else if (SexModel.Male === m) {
    return 1;
  } else if (SexModel.Female === m) {
    return 2;
  } else {
    throw `Unknown gender ${m}`;
  }
}


export function getRoomsBaseDict({roomId, volume, notifications, name, users}, oldRoom: RoomModel = null): RoomModel {
  return {
    id: roomId,
    receivingFiles: oldRoom ? oldRoom.receivingFiles : {},
    sendingFiles: oldRoom ? oldRoom.sendingFiles : {},
    volume,
    callInfo: {
      calls: {},
      showMic: true,
      callContainer: false,
      callActive: false,
      fullScreen: false,
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

export function convertNumberToSex(m: number): SexModel {
  return {
    '0': SexModel.Secret,
    '1': SexModel.Male,
    '2': SexModel.Female,
  }[m];
}

export function convertSexToString(m: string): string {
  return {
    '0': 'Secret',
    '1': 'Male',
    '2': 'Female',
  }[m];
}

export function convertStringSexToNumber(m: string): string {
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
  return {
    user: u.user,
    id: u.userId,
    sex: convertSex(u.sex),
  };
}