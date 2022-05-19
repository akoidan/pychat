import {DefaultWsInMessage} from "@common/ws/common";
import {
  OpponentWsId,
  WebRtcDefaultMessage
} from "@common/legacy";

export interface AcceptCallBody extends OpponentWsId, WebRtcDefaultMessage {

}
export type AcceptCallMessage = DefaultWsInMessage<"acceptCall", "webrtcTransfer:*", AcceptCallBody>;
