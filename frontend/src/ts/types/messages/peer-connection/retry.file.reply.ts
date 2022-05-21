import type {DefaultWsInMessage} from "@common/ws/common";

export type RetryFileReply = DefaultWsInMessage<"retryFileReply", "peerConnection:*", null>;
