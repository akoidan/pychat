export interface DefaultP2pMessage<A extends string, D> {
  action: A;
  data: D;
}

export interface DefaultRequestP2pMessage<A extends string, D> extends DefaultP2pMessage<A, D> {
  cbId: number;
}

export interface DefaultResponseP2pMessage<D> {
  data: D;
  resolveCbId: number;
}

export interface DefaultRequestResponseP2pMessage<D> {
  data: D;
  resolveCbId: number;
  cbId: number;
}
