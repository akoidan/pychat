import AbstractMessageProcessor from "@/ts/message_handlers/AbstractMessageProcessor";
import type {DefaultP2pMessage} from "@/ts/types/messages/p2pMessages";

export class P2PMessageProcessor extends AbstractMessageProcessor {
  public resolveCBifItsThere(data: DefaultP2pMessage<string>): boolean {
    this.logger.debug("resolving cb")();
    if (data.resolveCbId) {
      this.callBacks[data.resolveCbId].resolve(data);
      delete this.callBacks[data.resolveCbId];
      return true;
    }
    return false;
  }
}
