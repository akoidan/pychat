import type {DefaultWsInMessage} from "@common/ws/common";


export interface DestroyFileConnectionBody {
  status: "decline" | "success";
}

export type DestroyFileConnectionMessage = DefaultWsInMessage<"destroyFileConnection", "peerConnection:*", DestroyFileConnectionBody>;
