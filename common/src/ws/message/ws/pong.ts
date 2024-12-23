import type {
  DefaultWsInMessage,
  DefaultWsOutMessage
} from "@common/ws/common";

export interface PongBody {
  time: string;
}
export type PongWsOutMessage = DefaultWsOutMessage<"pong", PongBody>;

export type PongWsInMessage = DefaultWsInMessage<"pong", "ws", PongBody>
