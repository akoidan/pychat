class Throttle {
  private lastFired: number = 0;

  private readonly timeoutMs: number;
  // Private timeoutHandler: number = 0;

  private readonly handler: Function;

  public constructor(handler: Function, timeout: number) {
    if (timeout < 1000) {
      throw Error("Timeout should be at least 1s");
    }
    this.handler = handler;
    this.timeoutMs = timeout;
  }

  public fire() {
    const now = Date.now();
    if (now - this.timeoutMs > this.lastFired) {
      this.handler();
      this.lastFired = now;
    }

    /*
     * If (this.timeoutHandler !== 0) {
     *   this.timeoutHandler = window.setTimeout(() => {
     *     this.timeoutHandler = 0;
     *     this.handler();
     *     // 100ms in case something blocked event loop for 100ms
     *     // we don't care if something blocked more than 100ms and event fired twice
     *   }, this.timeoutMs - (now - this.lastFired) - 100)
     * }
     */
  }
}

export {Throttle};
