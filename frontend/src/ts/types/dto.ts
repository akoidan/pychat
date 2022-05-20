import {UserProfileDto} from "@common/model/dto/user.profile.dto";
import type {
    ChannelsDictModel,
    CurrentUserInfoModel,
    CurrentUserSettingsModel,
    MessageStatusModel,
    RoomDictModel,
    UserModel,
} from "@/ts/types/model";


export interface ViewUserProfileDto extends UserProfileDto {
  image: string;
}

export interface SetStateFromWS {
  roomsDict: RoomDictModel;
  channelsDict: ChannelsDictModel;
  allUsersDict: Record<number, UserModel>;
}

export interface SetStateFromStorage {
  roomsDict: RoomDictModel;
  channelsDict: ChannelsDictModel;
  settings: CurrentUserSettingsModel;
  profile: CurrentUserInfoModel;
  allUsersDict: Record<number, UserModel>;
}

export interface OauthStatus {
  google: boolean;
  facebook: boolean;
}

export interface WebRtcMessageModelDto extends Omit<MessageStatusModel, "roomId" | "time" | "userId"> {
  timeDiff: number;
}
