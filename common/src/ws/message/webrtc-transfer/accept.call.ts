import {DefaultWsInMessage} from "@common/ws/common";
import {
  OpponentWsId,
  WebRtcDefaultMessage
} from "@common/model/webrtc.base";

export interface AcceptCallBody extends OpponentWsId, WebRtcDefaultMessage {

}
export type AcceptCallMessage = DefaultWsInMessage<"acceptCall", "webrtcTransfer:*", AcceptCallBody>;
