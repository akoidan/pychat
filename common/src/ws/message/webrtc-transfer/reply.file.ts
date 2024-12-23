import type {DefaultWsInMessage} from "@common/ws/common";
import type {ReplyWebRtc} from "@common/model/webrtc.base";

export type ReplyFileWsInBody = ReplyWebRtc;

export type ReplyFileWsInMessage = DefaultWsInMessage<"replyFile", "webrtcTransfer:*", ReplyFileWsInBody>;
