import type {DefaultWsInMessage} from "@common/ws/common";
import type {
  BrowserBase,
  OpponentWsId,
  WebRtcDefaultMessage,
} from "@common/legacy";


export interface OfferBody extends OpponentWsId, WebRtcDefaultMessage {
  content: BrowserBase;
  roomId: number;
  userId: number;
  time: number;
}

export type OfferMessage = DefaultWsInMessage<"offerMessage", "webrtc", OfferBody>;
