import type {DefaultWsInMessage} from "@common/ws/common";
import type {ChangeUserOnlineBase} from "@common/model/ws.base";


export interface AddOnlineUserBody extends ChangeUserOnlineBase {
  opponentWsId: string;
}

export type AddOnlineUserMessage = DefaultWsInMessage<"addOnlineUser", "room", AddOnlineUserBody>;
