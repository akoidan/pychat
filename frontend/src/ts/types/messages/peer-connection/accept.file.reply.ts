import type {DefaultWsInMessage} from "@common/ws/common";

export type AcceptFileReply = DefaultWsInMessage<"acceptFileReply", "peerConnection:*", null>;
