import {DefaultMessage} from '../types/messages';
import MessageHandler from './MesageHandler';
import {globalLogger} from './singletons';

export default class Subscription {

  channels: { [id: string]: MessageHandler[] } = {};

  public subscribe(channel: string, messageHandler: MessageHandler) {
    if (!this.channels[channel]) {
      this.channels[channel] = [];
    }
    if (this.channels[channel].indexOf(messageHandler) < 0 ) {
      this.channels[channel].push(messageHandler);
    }
  }

  public notify(message: DefaultMessage) {
    if (this.channels[message.handler]) {
      this.channels[message.handler].forEach((h: MessageHandler) => {
        h.handle(message);
      });
    } else {
      globalLogger.log('Can\'t handle message {} because no channels found', message)();
    }
  }

}