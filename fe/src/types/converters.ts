import {CurrentUserInfoModel, CurrentUserSettingsModel} from './model';
import {UserProfileDto, UserSettingsDto} from './dto';


export function currentUserInfoDtoToModel(userInfo: UserProfileDto): CurrentUserInfoModel {
  return {...userInfo};
}

export function userSettingsDtoToModel(userInfo: UserSettingsDto): CurrentUserSettingsModel {
  return {...userInfo};
}

export function currentUserInfoModelToDto(userInfo: CurrentUserInfoModel): UserProfileDto {
  return {...userInfo};
}