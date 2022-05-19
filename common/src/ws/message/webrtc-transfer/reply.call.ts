import {DefaultWsInMessage} from "@common/ws/common";
import {ReplyWebRtc} from "@common/helpers";


export type ReplyCallBody = ReplyWebRtc;

export type ReplyCallMessage = DefaultWsInMessage<"replyCall", "webrtcTransfer:*", ReplyCallBody>;
