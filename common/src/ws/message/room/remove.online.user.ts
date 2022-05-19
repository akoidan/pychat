import type {DefaultWsInMessage} from "@common/ws/common";
import {ChangeUserOnlineBase} from "@common/legacy";

export type RemoveOnlineUserBody = ChangeUserOnlineBase;

export type RemoveOnlineUserMessage = DefaultWsInMessage<"removeOnlineUser", "room", RemoveOnlineUserBody>;
