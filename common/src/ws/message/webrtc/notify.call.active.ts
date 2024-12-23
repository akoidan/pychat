import type {DefaultWsInMessage} from "@common/ws/common";
import {
  OpponentWsId,
  WebRtcDefaultMessage
} from "@common/model/webrtc.base";

export interface NotifyCallActiveWsInBody extends WebRtcDefaultMessage, OpponentWsId {
  roomId: number;
  userId: number;
}

export type NotifyCallActiveWsInMessage = DefaultWsInMessage<"notifyCallActive", "webrtc", NotifyCallActiveWsInBody>;
