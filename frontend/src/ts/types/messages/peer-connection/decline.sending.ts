import type {DefaultWsInMessage} from "@common/ws/common";

export type DeclineSendingMessage = DefaultWsInMessage<"declineSending", "peerConnection:*", null>;
