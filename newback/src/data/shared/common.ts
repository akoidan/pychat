import { DefaultInMessage } from '@/data/shared/ws.in.messages';

export interface DefaultMessage<A extends string> {
  action: A;
}


/** CODE I PUT HERE MANUALLY WS IN */
/*
 * Any means that every every registered subscriber will be called with this handler if it exists
 * this means, that handler that registered this event will be called
 * void means that no handlers should process this signal
 */
export type HandlerName =
  "*"
  | "call"
  | "notifier"
  | "peerConnection:*"
  | "room"
  | "router"
  | "void"
  | "webrtc-message"
  | "webrtc"
  | "webrtcTransfer:*"
  | "ws-message"
  | "ws";


export type HandlerType<A extends string, H extends HandlerName> = (a: DefaultInMessage<A, H | "*">) => Promise<void> | void;

export type HandlerTypes<K extends string, H extends HandlerName> = {
  [Key in K]?: HandlerType<Key, H>
};
