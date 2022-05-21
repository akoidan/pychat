import {
  DefaultWsInMessage,
  DefaultWsOutMessage
} from "@common/ws/common";
import {WebRtcDefaultMessage} from "@common/model/webrtc.base";


export interface AcceptFileBody extends WebRtcDefaultMessage {
  received: number;
}


export type AcceptFileMessage = DefaultWsInMessage<"acceptFile", "peerConnection:*", AcceptFileBody>;

export type AcceptFileWsOutMessage = DefaultWsOutMessage<"acceptFile", AcceptFileBody>
