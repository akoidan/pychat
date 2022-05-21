import type {DefaultWsInMessage} from "@common/ws/common";
import {ChangeUserOnlineBase} from "@common/model/ws.base";

export type RemoveOnlineUserBody = ChangeUserOnlineBase;

export type RemoveOnlineUserMessage = DefaultWsInMessage<"removeOnlineUser", "room", RemoveOnlineUserBody>;
