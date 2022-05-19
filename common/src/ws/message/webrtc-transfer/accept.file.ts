import {DefaultWsInMessage} from "@common/ws/common";


export interface AcceptFileBody {
  received: number;
}

export type AcceptFileMessage = DefaultWsInMessage<"acceptFile", "peerConnection:*", AcceptFileBody>;
