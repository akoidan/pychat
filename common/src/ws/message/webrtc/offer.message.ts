import type {DefaultWsInMessage} from "@common/ws/common";
import {
  BrowserBase,
  OpponentWsId,
  WebRtcDefaultMessage
} from "@common/model/webrtc.base";


export interface OfferBody extends OpponentWsId, WebRtcDefaultMessage {
  content: BrowserBase;
  roomId: number;
  userId: number;
  time: number;
}

export type OfferMessage = DefaultWsInMessage<"offerMessage", "webrtc", OfferBody>;
