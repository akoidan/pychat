import type {DefaultWsInMessage} from "@common/ws/common";
import {
  BrowserBase,
  OpponentWsId,
  WebRtcDefaultMessage
} from "@common/model/webrtc.base";


export interface OfferFileContent extends BrowserBase {
  size: number;
  name: string;
}

export interface OfferFileBody extends OpponentWsId, WebRtcDefaultMessage {
  content: OfferFileContent;
  roomId: number;
  threadId: number | null;
  userId: number;
  time: number;
}

export type OfferFileMessage = DefaultWsInMessage<"offerFile", "webrtc", OfferFileBody>;
