import {CurrentUserInfoModel, CurrentUserSettingsModel, SexModel, UserModel} from './model';
import {SexModelDto, UserDto, UserProfileDto, UserSettingsDto} from './dto';


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

export function convertUser(u: UserDto): UserModel {
  return {
    user: u.user,
    id: u.userId,
    sex: convertSex(u.sex),
  };
}