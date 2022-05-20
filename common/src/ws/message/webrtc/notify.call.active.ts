import type {DefaultWsInMessage} from "@common/ws/common";
import {
  OpponentWsId,
  WebRtcDefaultMessage
} from "@common/model/webrtc.base";

export interface NotifyCallActiveBody extends WebRtcDefaultMessage, OpponentWsId {
  roomId: number;
  userId: number;
}

export type NotifyCallActiveMessage = DefaultWsInMessage<"notifyCallActive", "webrtc", NotifyCallActiveBody>;
