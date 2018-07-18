import {DefaultMessage} from '../types/messages';
import {Logger} from 'lines-logger';
import {IMessageHandler} from '../types/types';

export default abstract class MessageHandler implements IMessageHandler {

  protected abstract readonly logger: Logger;

  protected abstract readonly handlers: { [id: string]: SingleParamCB<DefaultMessage> };

  public handle(message: DefaultMessage) {
    if (!this.handlers) {
      throw `${this.constructor.name} has empty handlers`;
    }
    let handler: SingleParamCB<DefaultMessage> = this.handlers[message.action];
    if (handler) {
      handler.bind(this)(message);
    } else {
      this.logger.error(`{} can't find handler for {}, available handlers {}. Message: {}`, this.constructor.name, message.action, Object.keys(this.handlers), message)();
    }
  }
}