import type {
  DefaultWsInMessage,
  MultiResponseMessage,
  RequestWsOutMessage
} from "@common/ws/common";
import type {UserProfileDtoWoImage} from "@common/model/dto/user.profile.dto";

export type SetUserProfileBody = UserProfileDtoWoImage;
export type SetUserProfileMessage = MultiResponseMessage<"setUserProfile", "ws", SetUserProfileBody>;

export type SetUserProfileWsOutMessage = RequestWsOutMessage<"setUserProfile", SetUserProfileBody>;
