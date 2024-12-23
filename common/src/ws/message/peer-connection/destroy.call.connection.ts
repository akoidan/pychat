import type {
  DefaultWsInMessage,
  DefaultWsOutMessage
} from "@common/ws/common";
import {
  OpponentWsId,
  WebRtcDefaultMessage
} from "@common/model/webrtc.base";


export interface DestroyCallConnectionWsOutBody extends WebRtcDefaultMessage {
  status: "decline" | "hangup";
}

export type DestroyCallConnectionWsOutMessage = DefaultWsOutMessage<"destroyCallConnection", DestroyCallConnectionWsOutBody>;
export type DestroyCallConnectionWsInMessage = DefaultWsInMessage<"destroyCallConnection", "peerConnection:*", null>;
