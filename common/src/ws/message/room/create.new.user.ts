import type {DefaultWsInMessage} from "@common/ws/common";
import {UserDto} from "@common/model/dto/user.dto";

export interface CreateNewUserBody extends UserDto {
  rooms: {
    roomId: number;
    users: number[];
  }[];
}

export type CreateNewUsedMessage = DefaultWsInMessage<"createNewUser", "room", CreateNewUserBody>;
