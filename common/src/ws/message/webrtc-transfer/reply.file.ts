import type {DefaultWsInMessage} from "@common/ws/common";
import type {ReplyWebRtc} from "@common/model/webrtc.base";

export type ReplyFileBody = ReplyWebRtc;

export type ReplyFileMessage = DefaultWsInMessage<"replyFile", "webrtcTransfer:*", ReplyFileBody>;
