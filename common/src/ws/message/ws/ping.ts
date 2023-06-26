import type {DefaultWsInMessage} from "@common/ws/common";

export interface PingWsInBody {
  time: string;
}
export type PingWsInMessage = DefaultWsInMessage<"ping", "ws", PingWsInBody>;
