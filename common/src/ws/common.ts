// Every message that server sends to a client (browser) should be a structure like this
export interface DefaultWsInMessage<A extends string, H extends HandlerName, D> {
  action: A;
  data: D;
  handler: H;
}

// if sendToServerAndAwait it used
export interface ResponseWsInMessage <D> {
  data: D;
  cbBySender: string;
  cbId: number;
}

// if sendToServerAndAwait used but also other clients of this user should receive this message
export interface MultiResponseMessage <A extends string, H extends HandlerName, D> extends ResponseWsInMessage<D>, DefaultWsInMessage<A,H,D> {

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

