import type {DefaultWsInMessage} from "@common/ws/common";
import {ChangeUserOnlineBase} from "@common/model/ws.base";

export type RemoveOnlineUserWsInBody = ChangeUserOnlineBase;

export type RemoveOnlineUserWsInMessage = DefaultWsInMessage<"removeOnlineUser", "room", RemoveOnlineUserWsInBody>;
