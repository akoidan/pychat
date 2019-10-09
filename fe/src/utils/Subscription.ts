import {DefaultMessage} from '@/types/messages';
import {IMessageHandler} from '@/types/types';
import loggerFactory from '@/utils/loggerFactory';
import {Logger} from 'lines-logger';

export default class Subscription {
  private logger: Logger;

  constructor() {
    this.logger = loggerFactory.getLoggerColor('sub', '#3a7a7a');
  }

  channels: { [id: string]: IMessageHandler[] } = {};

  public subscribe(channel: string, messageHandler: IMessageHandler) {
    if (!this.channels[channel]) {
      this.channels[channel] = [];
    }
    if (this.channels[channel].indexOf(messageHandler) < 0 ) {
      this.logger.debug('subscribing to {}, subscribeer {}', channel, messageHandler)();
      this.channels[channel].push(messageHandler);
    }
  }

  public unsubscribe(channel: string) {
    let c = this.channels[channel];
    if (c) {
      this.logger.debug('Unsubscribing from channel {}', channel)();
      delete this.channels[channel];
    } else {
      this.logger.error('Unable to find channel to delete {}', channel)();
    }
  }

  public static getPeerConnectionId(connectionId: string, opponentWsId: string) {
    return `peerConnection:${connectionId}:${opponentWsId}`;
  }

  public static getTransferId(connectionId: string) {
    return `webrtcTransfer:${connectionId}`;
  }

  public notify(message: DefaultMessage): boolean {
    if (this.channels[message.handler] &&  this.channels[message.handler].length) {
      this.channels[message.handler].forEach((h: IMessageHandler) => {
        h.handle(message);
      });
      return true;
    } else {
      this.logger.error('Can\'t handle message {} because no channels found, available channels {}', message, this.channels)();
      return false;
    }
  }

}
