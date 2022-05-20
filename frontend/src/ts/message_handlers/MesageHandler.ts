import type {
  HandlerType,
  HandlerTypes
} from "@common/ws/common";
import type {IMessageHandler} from "@common/legacy";
import type {Logger} from "lines-logger";


export default abstract class MessageHandler implements IMessageHandler {
  protected abstract readonly logger: Logger;

  protected abstract readonly handlers: HandlerTypes<any>;

  // TODO message: any
  public handle(message: any) {
    if (!this.handlers) {
      throw Error(`${this.constructor.name} has empty handlers`);
    }
    const handler: HandlerType<string, any> | undefined = this.handlers[message.action];
    if (handler) {
      handler.bind(this)(message);
      this.logger.debug("Notified {}.{} => message", this.constructor.name, message.action, message);
    } else {
      this.logger.error("{} can't find handler for {}, available handlers {}. Message: {}", this.constructor.name, message.action, Object.keys(this.handlers), message)();
    }
  }

  getHandler(message: any): HandlerType<string, any> | undefined {
    return this.handlers[message.action];
  }
}
