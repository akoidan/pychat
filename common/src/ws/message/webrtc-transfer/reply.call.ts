import {DefaultWsInMessage} from "@common/ws/common";
import {ReplyWebRtc} from "@common/model/webrtc.base";

export type ReplyCallBody = ReplyWebRtc;

export type ReplyCallMessage = DefaultWsInMessage<"replyCall", "webrtcTransfer:*", ReplyCallBody>;
