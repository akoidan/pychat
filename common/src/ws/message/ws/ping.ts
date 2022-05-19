import type {DefaultWsInMessage} from "@common/ws/common";

export interface PingBody {
  time: string;
}
export type PingMessage = DefaultWsInMessage<"ping", "ws", PingBody>;
