import {DefaultMessage} from '@/types/messages';
import {Logger} from 'lines-logger';
import {IMessageHandler} from '@/types/types';


export type HandlerType = (a: DefaultMessage) => void;

export interface HandlerTypes {
 [id: string]: HandlerType;
}

export default abstract class MessageHandler implements IMessageHandler {

  protected abstract readonly logger: Logger;

  protected abstract readonly handlers: HandlerTypes;

  public handle(message: DefaultMessage) {
    if (!this.handlers) {
      throw Error(`${this.constructor.name} has empty handlers`);
    }
    let handler: HandlerType = this.handlers[message.action];
    if (handler) {
      handler.bind(this)(message);
    } else {
      this.logger.error(`{} can't find handler for {}, available handlers {}. Message: {}`, this.constructor.name, message.action, Object.keys(this.handlers), message)();
    }
  }
}
