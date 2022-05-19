import {DefaultWsInMessage} from "@common/ws/common";

export type RetryFileMessage = DefaultWsInMessage<"retryFile", "peerConnection:*", {}>;
