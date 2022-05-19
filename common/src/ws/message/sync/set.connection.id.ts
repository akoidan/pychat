import type {DefaultWsInMessage} from "@common/ws/common";
import type {WebRtcDefaultMessage} from "@common/legacy";
import {ResponseWsInMessage} from "@common/ws/common";

export interface WebRtcSetConnectionIdBody extends WebRtcDefaultMessage {
  time: number;
}
export type WebRtcSetConnectionIdMessage = ResponseWsInMessage<WebRtcSetConnectionIdBody>;
