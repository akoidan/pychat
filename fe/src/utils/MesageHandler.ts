import {DefaultMessage} from '../types/messages';
import {Logger} from 'lines-logger';

export default abstract class MessageHandler {

  protected abstract readonly logger: Logger;

  protected abstract readonly handlers: { [id: string]: SingleParamCB<DefaultMessage> };

  public handle(message: DefaultMessage) {
    let handler: SingleParamCB<DefaultMessage> = this.handlers[message.action];
    if (handler) {
      handler.bind(this)(message);
    } else {
      this.logger.error(`Can't find handler for {}`, message);
    }
  }
}