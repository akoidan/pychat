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
    return 3;
  }
}

export function convertSexStrToNumber(m: string): number {
  if (m === 'Secret') {
    return 0;
  } else if (m === 'Male') {
    return 1;
  } else if (m === 'Female') {
    return 2;
  } else {
    return 3;
  }
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