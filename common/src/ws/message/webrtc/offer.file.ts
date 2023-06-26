import type {
  DefaultWsInMessage,
  DefaultWsOutMessage,
  MultiResponseMessage,
  ResponseWsInMessage
} from "@common/ws/common";
import {
  BrowserBase,
  OpponentWsId,
  WebRtcDefaultMessage
} from "@common/model/webrtc.base";
import {RequestWsOutMessage} from "@common/ws/common";
import {WebRtcSetConnectionIdMessage} from "@common/ws/message/sync/set.connection.id";


export type OfferFileRequestWsOutBody = {
  roomId: number;
  threadId:number | null;
  browser: string;
  name: string;
  size: number;
}

export type OfferFileRequest = RequestWsOutMessage<"offerFile", OfferFileRequestWsOutBody>

export type OfferFileResponse = WebRtcSetConnectionIdMessage;

export interface OfferFileBody extends OfferFileRequestWsOutBody, OpponentWsId, WebRtcDefaultMessage {
  userId: number;
  time: number;
}

export type OfferFileResponse = MultiResponseMessage<"offerFile", "webrtc", OfferFileBody>;
