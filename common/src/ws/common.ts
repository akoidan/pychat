export interface DefaultWsInMessage<A extends string, H extends HandlerName, D> {
  action: A;
  data: D;
  handler: H;
}

export interface ResponseWsInMessage <D> {
  data: D;
  cbBySender: string;
  cbId: number;
}

export interface DefaultWsOutMessage<A extends string, D> {
  data: D;
  action: A;
}

export interface RequestWsOutMessage<A extends string, D> extends DefaultWsOutMessage<A, D> {
  cbId: number;
}


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

