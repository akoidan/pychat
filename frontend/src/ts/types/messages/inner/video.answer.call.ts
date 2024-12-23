import type {DefaultWsInMessage} from "@common/ws/common";

export type VideoAnswerCallMessage = DefaultWsInMessage<"videoAnswerCall", "webrtcTransfer:*", null>;
