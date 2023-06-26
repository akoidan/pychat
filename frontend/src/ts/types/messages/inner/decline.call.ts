import type {DefaultWsInMessage} from "@common/ws/common";

export type DeclineCallMessage = DefaultWsInMessage<"declineCall", "webrtcTransfer:*", null>;
