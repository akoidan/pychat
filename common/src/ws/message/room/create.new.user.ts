import type {DefaultWsInMessage} from "@common/ws/common";
import {UserDto} from "@common/model/dto/user.dto";

export interface CreateNewUserWsInBody extends UserDto {
  rooms: {
    roomId: number;
    users: number[];
  }[];
}

export type CreateNewUserWsInMessage = DefaultWsInMessage<"createNewUser", "room", CreateNewUserWsInBody>;
