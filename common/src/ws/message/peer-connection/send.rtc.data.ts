import type {
  DefaultWsInMessage,
  DefaultWsOutMessage
} from "@common/ws/common";
import {
  OpponentWsId,
  WebRtcDefaultMessage
} from "@common/model/webrtc.base";


export interface SendRtcDataBody extends OpponentWsId, WebRtcDefaultMessage {
  content: RTCIceCandidateInit | RTCSessionDescriptionInit | {message: unknown};
}

export type SendRtcDataWsInMessage = DefaultWsInMessage<"sendRtcData", "peerConnection:*", SendRtcDataBody>;

export type SendRtcDataWsOutMessage = DefaultWsOutMessage<"sendRtcData", any>
