import {DefaultMessage} from '../types/messages';
import {globalLogger} from './singletons';
import {IMessageHandler} from '../types/types';

export default class Subscription {

  channels: { [id: string]: IMessageHandler[] } = {};

  public subscribe(channel: string, messageHandler: IMessageHandler) {
    if (!this.channels[channel]) {
      this.channels[channel] = [];
    }
    if (this.channels[channel].indexOf(messageHandler) < 0 ) {
      this.channels[channel].push(messageHandler);
    }
  }

  public unsubscribe(channel: string) {
    let c = this.channels[channel];
    if (c) {
      delete this.channels[channel];
    }
  }

  public notify(message: DefaultMessage) {
    if (message.handler === 'void') {
      return;
    }
    if (this.channels[message.handler] &&  this.channels[message.handler].length) {
      this.channels[message.handler].forEach((h: IMessageHandler) => {
        h.handle(message);
      });
    } else {
      globalLogger.error('Can\'t handle message {} because no channels found, available channels {}', message, this.channels)();
    }
  }

}