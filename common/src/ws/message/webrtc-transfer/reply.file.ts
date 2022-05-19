import {DefaultWsInMessage} from "@common/ws/common";
import {ReplyWebRtc} from "@common/helpers";


export type ReplyFileBody = ReplyWebRtc;

export type ReplyFileMessage = DefaultWsInMessage<"replyFile", "webrtcTransfer:*", ReplyFileBody>;
