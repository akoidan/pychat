import type {ResponseWsInMessage,} from "@common/ws/common";

export interface GrowlWsInBody {
  error: string;
}
export interface GrowlWsInMessage extends ResponseWsInMessage<GrowlWsInBody> {
  action: "growlError";
}
