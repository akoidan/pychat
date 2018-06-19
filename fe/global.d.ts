interface SingleParamCB<T> {
  (t: T): void;
}

interface ErrorCB <T> {
  (a: T, t: string): void;
}