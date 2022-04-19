import type {Logger} from "lines-logger";
import {IMessageHandler} from "@/ts/types/shared/dto";
import {
  HandlerName,
  HandlerType,
  HandlerTypes
} from "@/ts/types/shared/common";
import {DefaultInMessage} from "@/ts/types/shared/ws.in.messages";


export default abstract class MessageHandler implements IMessageHandler {
  protected abstract readonly logger: Logger;

  protected abstract readonly handlers: HandlerTypes<any, any>;

  public handle(message: DefaultInMessage<string, HandlerName>) {
    if (!this.handlers) {
      throw Error(`${this.constructor.name} has empty handlers`);
    }
    const handler: HandlerType<string, HandlerName> | undefined = this.handlers[message.action];
    if (handler) {
      handler.bind(this)(message);
      this.logger.debug("Notified {}.{} => message", this.constructor.name, message.action, message);
    } else {
      this.logger.error("{} can't find handler for {}, available handlers {}. Message: {}", this.constructor.name, message.action, Object.keys(this.handlers), message)();
    }
  }

  getHandler(message: DefaultInMessage<string, HandlerName>): HandlerType<string, HandlerName> | undefined {
    return this.handlers[message.action];
  }
}
