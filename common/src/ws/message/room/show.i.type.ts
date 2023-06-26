import type {
  DefaultWsInMessage,
  DefaultWsOutMessage,
} from "@common/ws/common";

export interface ShowITypeWsInBody {
  roomId: number;
  userId: number;
}
export type ShowITypeWsInMessage = DefaultWsInMessage<"showIType", "room", ShowITypeWsInBody>;

export interface ShowITypeWsOutBody {
  roomId: number;
};

export type ShowITypeWsOutMessage = DefaultWsOutMessage<"showIType", ShowITypeWsOutBody>;
