import type {DefaultWsInMessage} from "@common/ws/common";
import type {ChangeUserOnlineBase} from "@common/helpers";


export interface AddOnlineUserBodyMessage extends ChangeUserOnlineBase {
  opponentWsId: string;
}

export type AddOnlineUserMessage = DefaultWsInMessage<"addOnlineUser", "room", AddOnlineUserBodyMessage>;
