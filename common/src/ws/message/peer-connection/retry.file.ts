import {DefaultWsInMessage} from "@common/ws/common";

export type RetryFileWsInMessage = DefaultWsInMessage<"retryFile", "peerConnection:*", null>;
