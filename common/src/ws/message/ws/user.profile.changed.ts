import type {DefaultWsInMessage} from "@common/ws/common";
import type {UserDto} from "@common/model/dto/user.dto";

export type UserProfileChangedWsInBody = UserDto;
export type UserProfileChangedWsInMessage = DefaultWsInMessage<"userProfileChanged", "ws", UserProfileChangedWsInBody>;
