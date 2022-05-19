import type {DefaultWsInMessage} from "@common/ws/common";
import type {
  OpponentWsId,
  WebRtcDefaultMessage,
} from "@common/legacy";


export interface SendRtcDataBody extends OpponentWsId, WebRtcDefaultMessage {
  content: RTCIceCandidateInit | RTCSessionDescriptionInit | {message: unknown};
}
export type SendRtcDataMessage = DefaultWsInMessage<"sendRtcData", "peerConnection:*", SendRtcDataBody>;
