import type {DefaultWsInMessage} from "@common/ws/common";
import type {
  OpponentWsId,
  WebRtcDefaultMessage,
} from "@common/legacy";


export interface DestroyCallConnectionBody extends OpponentWsId, WebRtcDefaultMessage {
  content: string;
}
export type DestroyCallConnectionMessage = DefaultWsInMessage<"destroyCallConnection", "peerConnection:*", DestroyCallConnectionBody>;
