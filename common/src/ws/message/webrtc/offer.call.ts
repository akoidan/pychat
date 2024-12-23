import type {
  DefaultWsInMessage,
  RequestWsOutMessage,
  ResponseWsInMessage,
} from "@common/ws/common";
import type {
  BrowserBase,
  OpponentWsId,
  WebRtcDefaultMessage,
  WebRtcSetConnectionIdBody,
} from "@common/model/webrtc.base";


export interface OfferCallRequestWsOutBody extends BrowserBase {
  roomId: number;
}

export interface OfferCallWsInBody extends OpponentWsId, WebRtcDefaultMessage, OfferCallRequestWsOutBody  {
  userId: number;
  time: number;
}

export type OfferCallWsInMessage = DefaultWsInMessage<"offerCall", "webrtc", OfferCallWsInBody>;
export type OfferCallRequestWsOutMessage = RequestWsOutMessage<"offerCall", OfferCallRequestWsOutBody>;
export type OfferCallResponseWsInMessage = ResponseWsInMessage<WebRtcSetConnectionIdBody>;
