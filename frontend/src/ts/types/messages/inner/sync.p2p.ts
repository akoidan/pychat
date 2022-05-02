import {DefaultInnerSystemMessage} from "@/ts/types/messages/helper";

export interface SyncP2PMessageBody {
  id: number;
}
export type SyncP2PMessage = DefaultInnerSystemMessage<"syncP2pMessage", "peerConnection:*", SyncP2PMessageBody>
