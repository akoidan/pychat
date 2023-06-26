import type {DefaultWsInMessage} from "@common/ws/common";
import type {ChangeUserOnlineBase} from "@common/model/ws.base";


export interface AddOnlineUserWsInBody extends ChangeUserOnlineBase {
  opponentWsId: string;
}

export type AddOnlineUserWsInMessage = DefaultWsInMessage<"addOnlineUser", "room", AddOnlineUserWsInBody>;
