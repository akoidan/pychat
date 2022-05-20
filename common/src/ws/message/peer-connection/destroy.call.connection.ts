import type {DefaultWsInMessage} from "@common/ws/common";
import {
  OpponentWsId,
  WebRtcDefaultMessage
} from "@common/model/webrtc.base";


export interface DestroyCallConnectionBody extends OpponentWsId, WebRtcDefaultMessage {
  content: string;
}
export type DestroyCallConnectionMessage = DefaultWsInMessage<"destroyCallConnection", "peerConnection:*", DestroyCallConnectionBody>;
