import type {DefaultWsInMessage} from "@common/ws/common";
import type {
  BrowserBase,
  OpponentWsId,
  WebRtcDefaultMessage,
} from "@common/legacy";


export interface OfferCallBody extends OpponentWsId, WebRtcDefaultMessage {
  content: BrowserBase;
  roomId: number;
  userId: number;
  time: number;
}

export type OfferCallMessage = DefaultWsInMessage<"offerCall", "webrtc", OfferCallBody>;
