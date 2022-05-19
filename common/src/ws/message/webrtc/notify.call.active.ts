import type {DefaultWsInMessage} from "@common/ws/common";
import type {
  OpponentWsId,
  WebRtcDefaultMessage,
} from "@common/legacy";

export interface NotifyCallActiveBody extends WebRtcDefaultMessage, OpponentWsId {
  roomId: number;
  userId: number;
}

export type NotifyCallActiveMessage = DefaultWsInMessage<"notifyCallActive", "webrtc", NotifyCallActiveBody>;
