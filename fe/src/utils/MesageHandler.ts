import {DefaultMessage} from './dto';

export default abstract class MessageHandler {

  protected abstract getMethodHandlers();

  public handle(message: DefaultMessage) {
    let handler = this.getMethodHandlers()[message.action];
    if (handler) {
      handler.bind(this)(message);
    } else {
      throw `Can't find handler for ${message.action} for message ${JSON.stringify(message)}`;
    }
  }
}