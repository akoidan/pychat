import type {DefaultWsInMessage} from "@common/ws/common";


export interface DestroyFileConnectionWsInBody {
  status: "decline" | "success";
}

export type DestroyFileConnectionWsInMessage = DefaultWsInMessage<"destroyFileConnection", "peerConnection:*", DestroyFileConnectionWsInBody>;
