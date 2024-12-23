import {DefaultWsInMessage} from "@common/ws/common";
import {
  OpponentWsId,
  WebRtcDefaultMessage
} from "@common/model/webrtc.base";

export interface AcceptCallWsInBody extends OpponentWsId, WebRtcDefaultMessage {

}
export type AcceptCallWsInMessage = DefaultWsInMessage<"acceptCall", "webrtcTransfer:*", AcceptCallWsInBody>;
