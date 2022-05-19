import type {DefaultWsInMessage} from "@common/ws/common";
import type {
  OfferFileContent,
  OpponentWsId,
  WebRtcDefaultMessage,
} from "@common/legacy";

export interface OfferFileBody extends OpponentWsId, WebRtcDefaultMessage {
  content: OfferFileContent;
  roomId: number;
  threadId: number | null;
  userId: number;
  time: number;
}

export type OfferFileMessage = DefaultWsInMessage<"offerFile", "webrtc", OfferFileBody>;
