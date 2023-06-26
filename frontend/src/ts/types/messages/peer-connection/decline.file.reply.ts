import type {DefaultWsInMessage} from "@common/ws/common";

export type DeclineFileReply = DefaultWsInMessage<"declineFileReply", "peerConnection:*", null>;
