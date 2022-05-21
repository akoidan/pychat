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


export interface OfferCallRequestBody extends BrowserBase {
  roomId: number;
}

export interface OfferCallBody extends OpponentWsId, WebRtcDefaultMessage, OfferCallRequestBody  {
  userId: number;
  time: number;
}

export type OfferCallMessage = DefaultWsInMessage<"offerCall", "webrtc", OfferCallBody>;
export type OfferCallRequest = RequestWsOutMessage<"offerCall", OfferCallRequestBody>;
export type OfferCallResponse = ResponseWsInMessage<WebRtcSetConnectionIdBody>;
