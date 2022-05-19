import type {DefaultWsInMessage} from "@common/ws/common";
import type {UserProfileDtoWoImage} from "@common/model/dto/user.profile.dto";

export type SetUserProfileBody = UserProfileDtoWoImage;
export type SetUserProfileMessage = DefaultWsInMessage<"setUserProfile", "ws", SetUserProfileBody>;
