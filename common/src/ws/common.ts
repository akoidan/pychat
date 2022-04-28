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


export type HandlerType<A extends string, H extends HandlerName, D> = (a: DefaultWsInMessage<A, H | "*", D>) => Promise<void> | void;

export type HandlerTypes<K extends string, H extends HandlerName, D> = {
  [Key in K]?: HandlerType<Key, H, D>
};
