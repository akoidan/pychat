import AbstractMessageProcessor from "@/ts/message_handlers/AbstractMessageProcessor";
import type Subscription from "@/ts/classes/Subscription";
import type {MessageSupplier} from "@/ts/types/types";
import type {DefaultStore} from "@/ts/classes/DefaultStore";
import {
  DefaultWsInMessage,
  GrowlMessage
} from "@/ts/types/shared/ws.in.messages";
import {HandlerName} from "@/ts/types/shared/common";

export class WsMessageProcessor extends AbstractMessageProcessor {
  private readonly sub: Subscription;

  public constructor(target: MessageSupplier, store: DefaultStore, label: string, sub: Subscription) {
    super(target, store, label);
    this.sub = sub;
  }

  public handleMessage(data: DefaultWsInMessage<string, HandlerName>) {
    if (data.handler !== "void" && data.action !== "growlError") {
      this.sub.notify(data);
    }
    if (data.cbId && this.callBacks[data.cbId] && (!data.cbBySender || data.cbBySender === this.target.getWsConnectionId())) {
      this.logger.debug("resolving cb")();
      if (data.action === "growlError") {
        this.callBacks[data.cbId].reject(Error((data as unknown as GrowlMessage).content));
      } else {
        this.callBacks[data.cbId].resolve(data);
      }
      delete this.callBacks[data.cbId];
    } else if (data.action === "growlError") {
      // GrowlError is used only in case above, so this is just a fallback that will never happen
      this.store.growlError((data as unknown as GrowlMessage).content);
    }
  }

  public parseMessage(jsonData: string): DefaultWsInMessage<string, HandlerName> | null {
    const data: DefaultWsInMessage<string, HandlerName> | null = super.parseMessage(jsonData);
    if (data?.handler !== "void" && (!data?.handler || !data.action)) {
      this.logger.error("Invalid message structure")();

      return null;
    }
    return data;
  }
}
