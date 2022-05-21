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


export type OfferFileRequestBody = {
  roomId: number;
  threadId:number | null;
  browser: string;
  name: string;
  size: number;
}

export type OfferFileRequest = RequestWsOutMessage<"offerFile", OfferFileRequestBody>

export type OfferFileResponse = WebRtcSetConnectionIdMessage;

export interface OfferFileBody extends OfferFileRequestBody, OpponentWsId, WebRtcDefaultMessage {
  userId: number;
  time: number;
}

export type OfferFileMessage = MultiResponseMessage<"offerFile", "webrtc", OfferFileBody>;
