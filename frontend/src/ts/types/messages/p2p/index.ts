export interface DefaultP2pMessage<A extends string> {
  action: A;
  resolveCbId?: number;
  cbId?: number;
}
