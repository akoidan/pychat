import type {DefaultWsInMessage} from "@common/ws/common";
import type {UserDto} from "@common/model/dto/user.dto";

export type UserProfileChangedBody = UserDto;
export type UserProfileChangedMessage = DefaultWsInMessage<"userProfileChanged", "ws", UserProfileChangedBody>;
