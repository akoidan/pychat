import type {DefaultWsInMessage} from "@common/ws/common";

export type AnswerCallMessage = DefaultWsInMessage<"answerCall", "webrtcTransfer:*", null>;
