import {DefaultWsInMessage} from "@common/ws/common";
import {ReplyWebRtc} from "@common/model/webrtc.base";

export type ReplyCallWsInBody = ReplyWebRtc;

export type ReplyCallWsInMessage = DefaultWsInMessage<"replyCall", "webrtcTransfer:*", ReplyCallWsInBody>;
