import {
  DefaultWsInMessage,
  DefaultWsOutMessage
} from "@common/ws/common";
import {WebRtcDefaultMessage} from "@common/model/webrtc.base";


export interface AcceptFileWsInBody extends WebRtcDefaultMessage {
  received: number;
}

export type AcceptFileWsOutBody = AcceptFileWsInBody;

export type AcceptFileWsInMessage = DefaultWsInMessage<"acceptFile", "peerConnection:*", AcceptFileWsInBody>;

export type AcceptFileWsOutMessage = DefaultWsOutMessage<"acceptFile", AcceptFileWsOutBody>
