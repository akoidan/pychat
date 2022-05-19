import type {DefaultWsInMessage} from "@common/ws/common";

export interface PongBody {
  time: string;
}
export type PongMessage = DefaultWsInMessage<"pong", "ws", PongBody>;
