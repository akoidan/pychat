import type {DefaultWsInMessage} from "@common/ws/common";
import {
  OpponentWsId,
  WebRtcDefaultMessage
} from "@common/model/webrtc.base";


export interface SendRtcDataBody extends OpponentWsId, WebRtcDefaultMessage {
  content: RTCIceCandidateInit | RTCSessionDescriptionInit | {message: unknown};
}
export type SendRtcDataMessage = DefaultWsInMessage<"sendRtcData", "peerConnection:*", SendRtcDataBody>;
